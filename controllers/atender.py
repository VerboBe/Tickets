import web
import time

# Importamos las variables de memoria y el render desde index.py
from controllers.index import render, fila_normal, fila_prioritaria, estadisticas

class Atender:
    def GET(self):
        # Usamos las variables importadas para mostrar la pantalla
        return render.atender(fila_normal, fila_prioritaria, estadisticas, time)

    def POST(self):
        ticket_actual = None
        if fila_prioritaria:
            ticket_actual = fila_prioritaria.popleft()
        elif fila_normal:
            ticket_actual = fila_normal.popleft()

        if ticket_actual:
            estadisticas['atendidos'] += 1
            estadisticas['tiempo_total'] += ticket_actual['tiempo']
            estadisticas['ultimo_atendido'] = ticket_actual
            if ticket_actual['prioridad'] == 'prioritaria':
                estadisticas['prioritarios'] += 1

        raise web.seeother('/atender')