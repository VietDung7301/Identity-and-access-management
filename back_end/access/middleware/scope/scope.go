package scope

import (
	"access/helpers/jsonparse"
	"access/helpers/jwtparse"
	"access/helpers/responses"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

type ScopeMiddleware struct {
	//
}

type RequestBody struct {
	Method       string
	Url          string
	Content_type string
}

func (smw *ScopeMiddleware) Handler(next http.Handler) http.Handler {
	fmt.Printf("scope mdw in\n")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authorization := r.Header.Get("Authorization")
		if authorization == "" {
			responses.ResponseInvalidRequest(w)
			return
		}
		arr := strings.Split(authorization, " ")
		token := arr[1]
		claims := jwtparse.GetClaims(token)
		if claims == nil {
			responses.ResponseInvalidRequest(w)
			return
		}
		data := RequestBody{
			Method:       r.FormValue("method"),
			Url:          r.FormValue("url"),
			Content_type: r.FormValue("content_type"),
		}

		if verifyScopes(data.Url, data.Method, claims["scope"]) {
			fmt.Printf("scope mdw out\n")
			next.ServeHTTP(w, r)
		} else {
			responses.Response(w, http.StatusForbidden, "url is not in scope!", nil)
			return
		}
	})
}

func verifyScopes(url_string string, method string, scopes interface{}) bool {
	client := &http.Client{}
	body := url.Values{}
	body.Set("url", url_string)
	body.Set("method", method)
	body.Set("scopes", scopes.(string))

	roleUrl := fmt.Sprintf("%s/api/permission/check", os.Getenv("ROLE_URL"))
	encodedBody := body.Encode()
	req, err := http.NewRequest(http.MethodPost, roleUrl, strings.NewReader(encodedBody))
	if err != nil {
		fmt.Printf("ko tao dc req\n")
		return false
	}
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	response, err := client.Do(req)
	if err != nil {
		fmt.Printf("api call error\n")
		return false
	}

	if response.StatusCode != 200 {
		fmt.Printf("status code != 200\n")
		return false
	}
	defer response.Body.Close()

	data, err := io.ReadAll(response.Body)
	if err != nil {
		fmt.Printf("ko doc duoc response\n")
		return false
	}

	responseCheck := jsonparse.JsonSimpleParse(data)

	return responseCheck["data"].(map[string]interface{})["check"].(bool)
}
