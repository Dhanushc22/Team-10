## HSN API Integration

This project uses the official Government GST HSN search API via the backend as a proxy. The frontend never calls the GST API directly; it calls our Django endpoint which handles CORS, formats the response, and adds basic GST rate mapping.

### Backend Endpoint

- URL: `/api/master-data/hsn-search/`
- Method: `GET`
- Auth: Required (`Authorization: Token <token>`)
- Query parameters:
  - `inputText` (string, required): search text (min 3 characters)
  - `selectedType` (string, required): `byCode` or `byDesc`
  - `category` (string, optional): `P` (Product), `S` (Service), or `null`

Example request:
```http
GET /api/master-data/hsn-search/?inputText=furniture&selectedType=byDesc&category=P
Authorization: Token <your_token>
Accept: application/json
```

Example response (transformed):
```json
[
  {
    "hsn_code": "940370",
    "description": "FURNITURE OF PLASTICS",
    "gst_rate": "12"
  },
  {
    "hsn_code": "940340",
    "description": "WOODEN FURNITURE OF A KIND USED IN THE KITCHEN",
    "gst_rate": "12"
  }
]
```

Notes:
- The backend transforms GST fields (`c` → `hsn_code`, `n` → `description`).
- `gst_rate` is a lightweight mapping for common codes. If you need authoritative rates per item, integrate a dedicated tax-rate source.
- Input validation: the backend requires at least 3 characters to avoid upstream 400s.

### Frontend Usage

- Component: `HSNSearchInput`
  - Debounced search; shows suggestions as the user types
  - Requires login so the `Token` header is sent automatically
  - Only triggers search when input length is valid

- Service: `frontend/src/services/gstAPI.js`
  - Base URL: `process.env.REACT_APP_API_URL` or `http://localhost:8000/api`
  - Sends `Authorization: Token <token>` from `localStorage.token`
  - Uses real API; explicit fallback (`searchWithFallback`) available if needed

### Configuration

Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### Troubleshooting

- 401/403 Authentication missing: ensure you are logged in and `localStorage.token` is present.
- 400 input length: use at least 3 characters (`inputText`).
- 502 Bad Gateway: temporary upstream GST API issue; try again or use `searchWithFallback` in dev scenarios.
- CORS: handled by backend proxy; do not call the GST API directly from the browser.

### Curl Examples

```bash
curl -H "Authorization: Token <token>" \
  "http://localhost:8000/api/master-data/hsn-search/?inputText=9403&selectedType=byCode&category=null"

curl -H "Authorization: Token <token>" \
  "http://localhost:8000/api/master-data/hsn-search/?inputText=furniture&selectedType=byDesc&category=P"
```


