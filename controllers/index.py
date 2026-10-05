import web
from collections import deque

render = web.template.render('views/')

# Variables para simular la base de datos
fila_normal = deque()
fila_prioritaria = deque()
contador_id = 1

estadisticas = {
    'atendidos': 0,
    'tiempo_total': 0,
    'prioritarios': 0,
    'ultimo_atendido': None
}

class Index:
    def GET(self):
        # Envio de las filas y las estadísticas al archivo index.html
        return render.index(fila_normal, fila_prioritaria, estadisticas)

    def POST(self):
        global contador_id
        # Recibimos los datos del formulario HTML
        form = web.input(action=None)

        # Si el usuario hizo clic en "Registrar"
        if form.action == 'registrar':
            nuevo_ticket = {
                'id': contador_id,
                'cliente': form.cliente,
                'problema': form.problema,
                'prioridad': form.prioridad,
                'tiempo': int(form.tiempo)
            }
            contador_id += 1

            if form.prioridad == 'prioritaria':
                fila_prioritaria.append(nuevo_ticket)
            else:
                fila_normal.append(nuevo_ticket)


        # Redirigimos a la misma página para recargar los datos
        raise web.seeother('/')