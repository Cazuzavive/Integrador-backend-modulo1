const express = require('express')
const app = express()
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT ?? 3000
const morgan = require('morgan')
const mongoose = require('mongoose')


//Obtener la URI desde las variables de entorno
const URI = process.env.MONGODB_URLSTRING
const DATABASE_NAME = process.env.DATABASE_NAME

//Conectar a MongoDB usando Mongoose
mongoose
    .connect(URI + '/' + DATABASE_NAME)
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.error(err))

//Definir el esquema con el que va a trabajar Mongoose
const productosSchema = new mongoose.Schema({
    codigo: Number,
    nombre: String,
    precio: Number,
    categorias: [String]
})
const Productos = mongoose.model('productos', productosSchema)

//Middleware
app.use(express.json())
app.use(morgan('dev'))

//Ruta principal
app.get('/', (req, res) => {
    res.json('Bienvenidos a la API de Productos Electronicos')
})

//Ruta para obtener todos los productos
app.get('/electronicos', async (req, res) => {
    try {
        const products = await Productos.find()
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// Ruta para mostrar los productos de una categoria
app.get('/electronicos/categorias/:nombre', async (req, res) => {
    try {
        const products = await Productos.find({ categorias: req.params.nombre })
        res.json(products)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Ruta para mostrar un producto por ID

app.get('/electronicos/:id', getProduct, (req, res) => {
    res.json(res.product)
})

async function getProduct(req, res, next) {
    let product
    try {
        product = await Productos.findById(req.params.id)
        if (product == null) {
            return res.status(404).json({ message: 'No se encontró el producto' })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
    res.product = product
    next()
}

//Ruta para crear un nuevo producto

app.post('/electronicos/', async (req, res) => {
    const product = new Productos({
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        precio: req.body.precio,
        categorias: req.body.categorias
    })

    try {
        const newProduct = await product.save()
        res.status(201).json(newProduct)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Ruta para actualizar un producto

app.put('/electronicos/:id', getProduct, async (req, res) => {
    if (req.body.codigo != null) {
        res.product.codigo = req.body.codigo
    }
    if (req.body.nombre != null) {
        res.product.nombre = req.body.nombre
    }
    if (req.body.precio != null) {
        res.product.precio = req.body.precio
    }
    if (req.body.categorias != null) {
        res.product.categorias = req.body.categorias
    }

    try {
        const updatedProduct = await res.product.save()
        res.json(updatedProduct)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Ruta para eliminar un producto

app.delete('/electronicos/:id', getProduct, async (req, res) => {
    try {
        await res.product.remove()
        res.json({ message: 'Producto eliminado exitosamente' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Error 404

app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' })
})

//Error 500

app.use((error, req, res, next) => {
    res.status(500).json({ message: error.message })
})

//Ejecutar el servidor
//node server.js o npm start
//Abrir en un navegador: http://localhost:3000/
//Abrir en Postman: https://www.postman.com/
//Importar la colección de pruebas en Postman: https://github.com/gatak/Clase-12-plantilla-inicial-ejercitacion-main/blob/main/API_Productos_Electronicos.postman_collection.json
//Ejecutar las pruebas en Postman para probar la API de Productos Electronicos.
//Ejecutar el comando npm run dev para iniciar el entorno de desarrollo con nodemon.
//Ejecutar el comando npm test para correr las pruebas unitarias.
//Ejecutar el comando npm run coverage para ver el reporte de cobertura de pruebas.
//Inicializar servidor
app.listen(port, () => {
    console.log(`App listenig on http://localhost:${port}`)
})