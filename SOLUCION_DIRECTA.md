# SOLUCIÓN DIRECTA Y SIMPLE - USAR LA INTERFAZ GRÁFICA

## OLVIDAR EL SQL POR UN MOMENTO

Dado que estamos teniendo problemas con los tipos de datos en SQL, la solución más rápida y segura es usar la interfaz gráfica de Supabase.

## PASOS A SEGUIR:

### PASO 1: Acceder al panel de Supabase
1. Abre: https://tmqglnycivlcjijoymwe.supabase.co
2. Inicia sesión con tu cuenta de administrador

### PASO 2: Ir a Authentication
1. En el menú lateral, haz clic en **Authentication**
2. Haz clic en **Users**

### PASO 3: Encontrar al usuario
1. Busca en la lista de usuarios el que tenga "Camilo" en el nombre
2. Revisa la columna **Display Name** o **Email**
3. Haz clic en ese usuario para ver sus detalles

### PASO 4: Editar los metadatos
1. Desplázate hacia abajo hasta encontrar **User Metadata**
2. Busca el campo `name`
3. Cambia "Camilo Alegria" por "Juan Pablo Riesco"
4. Haz clic en **Save**

### PASO 5: Verificar
1. Abre tu aplicación: `http://localhost:3003/panel-principal`
2. Limpia el caché (Ctrl+F5 o Cmd+Shift+R)
3. Debería mostrar: "Buenos días, Juan Pablo Riesco"

## SI NO ENCUENTRAS EL USUARIO:

### Opción A: Crear un nuevo usuario correcto
1. En **Authentication → Users**, haz clic en **Add user**
2. Ingresa el email y contraseña
3. En **User Metadata**, agrega:
   ```json
   {
     "name": "Juan Pablo Riesco"
   }
   ```
4. Guarda y usa ese nuevo usuario

### Opción B: Forzar recreación de perfil
1. Cierra sesión en la aplicación actual
2. Limpia todo el caché del navegador
3. Vuelve a iniciar sesión
4. Esto debería crear un perfil nuevo con los datos correctos

## SI NADA FUNCIONA:

### Limpiar datos locales completamente:
1. En el navegador, presiona F12
2. Ve a **Application** → **Local Storage**
3. Elimina todo de localhost:3003
4. Ve a **Session Storage**
5. Elimina todo de localhost:3003
6. Cierra el navegador completamente
7. Abre nuevamente y vuelve a iniciar sesión

## NOTA FINAL

La interfaz gráfica de Supabase es mucho más confiable que el SQL para este caso específico, ya que maneja automáticamente los tipos de datos y permisos.