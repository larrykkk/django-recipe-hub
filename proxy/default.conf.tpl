server {
    listen ${LISTEN_PORT};

    location / {
        proxy_pass http://frontend:5173;
    }

    location /api {
        uwsgi_pass              ${APP_HOST}:${APP_PORT};
        include                 /etc/nginx/uwsgi_params;
        client_max_body_size    10M;
    }
}