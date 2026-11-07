// Package notify delivers care alerts to stakeholder WhatsApp groups.
//
// Meta's WhatsApp Business (Cloud) API cannot post into groups, so group alerts
// go through a WhatsApp gateway that supports groups. The gateway is called
// with POST <WHATSAPP_GATEWAY_URL> {"to": "<group id>", "body": "<text>"} and
// "Authorization: Bearer <WHATSAPP_GATEWAY_TOKEN>" (the shape Whapi.Cloud's
// /messages/text endpoint uses). Without a gateway configured, alerts are
// written to the server log so the flow can be developed and tested.
package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

type Notifier interface {
	// Send posts text to a WhatsApp group (or chat) id.
	Send(ctx context.Context, to, text string) error
}

// LogNotifier prints alerts instead of sending them (development).
type LogNotifier struct{}

func (LogNotifier) Send(_ context.Context, to, text string) error {
	log.Printf("[whatsapp:dev] to=%s\n%s", to, text)
	return nil
}

// GatewayNotifier posts to a WhatsApp gateway that supports groups.
type GatewayNotifier struct {
	URL    string
	Token  string
	Client *http.Client
}

func (g GatewayNotifier) Send(ctx context.Context, to, text string) error {
	if to == "" {
		return fmt.Errorf("no WhatsApp group configured for this partner")
	}
	body, _ := json.Marshal(map[string]string{"to": to, "body": text})
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, g.URL, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if g.Token != "" {
		req.Header.Set("Authorization", "Bearer "+g.Token)
	}
	client := g.Client
	if client == nil {
		client = &http.Client{Timeout: 10 * time.Second}
	}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		msg, _ := io.ReadAll(io.LimitReader(res.Body, 512))
		return fmt.Errorf("whatsapp gateway: %s: %s", res.Status, msg)
	}
	return nil
}

// New picks the gateway when configured, otherwise the log.
func New(url, token string) Notifier {
	if url == "" {
		log.Println("WHATSAPP_GATEWAY_URL not set; care alerts are written to the log")
		return LogNotifier{}
	}
	return GatewayNotifier{URL: url, Token: token}
}
