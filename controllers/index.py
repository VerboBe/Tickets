import web
from collections import deque
import time

render = web.template.render('views/')

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
        return render.index(contador_id)

    def POST(self):
        global contador_id
        form = web.input()

        nuevo_ticket = {
            'id': contador_id,
            'cliente': form['nombre-cliente'],
            'problema': form['tipo-problema'],
            'prioridad': form['prioridad'],
            'tiempo': int(form['tiempo-estimado']),
            'registro': time.time()
        }
        contador_id += 1

        if form['prioridad'] == 'prioritaria':
            fila_prioritaria.append(nuevo_ticket)
        else:
            fila_normal.append(nuevo_ticket)

        return self.GET()