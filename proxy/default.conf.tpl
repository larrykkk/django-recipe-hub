server {
    listen ${LISTEN_PORT};

    location / {
        proxy_pass http://frontend:5173;
    }

    location /api/ {
        proxy_pass http://app:8000;
    }
}