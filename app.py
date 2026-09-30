import web

web.config.debug = False

urls = (
    '/', 'controllers.index.Index'
)

app = web.application(urls, globals())

if __name__ == "__main__":
    app.run()