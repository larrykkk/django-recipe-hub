server {
    listen ${LISTEN_PORT};

    # 前端路由 - 根路徑指向前端服務
    location / {
        proxy_pass http://frontend:5173;
    }

    # 靜態文件路由
    location /static {
        alias /vol/static;
    }

    # 後端 API 路由
    location /api {
        uwsgi_pass              ${APP_HOST}:${APP_PORT};
        include                 /etc/nginx/uwsgi_params;
        client_max_body_size    10M;
    }

    # admin 路由
    location /admin {
        uwsgi_pass              ${APP_HOST}:${APP_PORT};
        include                 /etc/nginx/uwsgi_params;
        client_max_body_size    10M;
    }
}