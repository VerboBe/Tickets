import web

urls = (
    '/', 'controllers.index.Index',
    '/atender', 'controllers.atender.Atender'
)

app = web.application(urls, globals())

if __name__ == "__main__":
    app.run()