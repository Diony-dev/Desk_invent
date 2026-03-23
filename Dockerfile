# Usa una imagen oficial de Python en su versión slim para optimizar tamaño
FROM python:3.10-slim

# Variables de entorno para optimizar Python en Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crea y ubícate en el directorio de trabajo del contenedor
WORKDIR /app

# Copiar primero el archivo de requisitos para aprovechar el caché de capas de Docker
COPY requirements.txt .

# Instalar dependencias del sistema y módulos de Python
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el resto de los archivos del proyecto al contenedor (ignorando los de .dockerignore)
COPY . .

# Exponer el puerto por el que correrá la aplicación
EXPOSE 5000

# Cambia al directorio src donde vive tu app.py principal
WORKDIR /app/src

# Usa Gunicorn para servir la aplicación de Flask en producción
# Se exponen 4 procesos trabajadores por defecto corriendo en el puerto 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
