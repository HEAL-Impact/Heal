package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/heal/internal/services"
)

// PartnerAuthRequired admits signed-in partner staff. With roles given, only
// those roles get through (for example, admin-only partner management).
func PartnerAuthRequired(auth *services.PartnerAuthService, roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, ok := strings.CutPrefix(c.GetHeader("Authorization"), "Bearer ")
		if !ok || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Partner sign-in required"})
			return
		}
		account, err := auth.Validate(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Your partner session has ended. Please sign in again."})
			return
		}
		if len(roles) > 0 {
			allowed := false
			for _, r := range roles {
				if account.Role == r {
					allowed = true
				}
			}
			if !allowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Your account cannot do this"})
				return
			}
		}
		c.Set("partner_account", account)
		c.Next()
	}
}

// PartnerAccount returns the signed-in partner account.
func PartnerAccount(c *gin.Context) *services.PartnerAccount {
	a, _ := c.Get("partner_account")
	account, _ := a.(*services.PartnerAccount)
	return account
}
