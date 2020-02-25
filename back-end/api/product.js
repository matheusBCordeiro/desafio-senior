module.exports = app => {

    const { existsOrError} = app.api.validation

    const saveProduct = (req, res) => {
        const product = { ...req.body }
        try {
            existsOrError(product.name, 'Nome não informado')
            existsOrError(product.description, 'Descrição não informada')
            existsOrError(product.price, 'Preço não informado')
        } catch (exception) {
            return res.status(400).send(exception)
        }
        product.createdAt = new Date()
        product.status = 'pending'
        app.db('products')
            .insert(product)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    const saveResponse = async (req, res) => {
        const product = { ...req.body }
        if (req.params.id) product.id = req.params.id
        let productFromDB = undefined
        try {
            existsOrError(req.params.id, "ID não informado")
            existsOrError(product.status, "Status não informado")
            if (product.status === 'refuse')
                existsOrError(product.observation, "Observação não informada")
            productFromDB = await app.db('products')
                .where({ id: product.id }).first()
            existsOrError(productFromDB, 'Produto não encontrado')
        } catch (exception) {
            return res.status(400).send(exception)
        }
        app.db('products')
            .update(product)
            .where({ id: product.id })
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
    }

    const getProducts = (req, res) => {
        let query = {}
        let name = "", description = "", price = "", observation = ""
        let page = req.query.page || 1
        let per_page = req.query.per_page || 10;
        if (page < 1) page = 1;
        if (req.query.status) query.status = req.query.status
        if (req.query.filter) {
            name = req.query.filter
            description = req.query.filter
            price = req.query.filter
            observation = req.query.filter
        }
        app.db('products')
            .where(query)
            .andWhere(function () {
                this.where('name', 'like', `%${name}%`)
                    .orWhere('description', 'like', `%${description}%`)
                    .orWhere('price', 'like', `%${price}%`)
                    .orWhere('observation', 'like', `%${observation}%`)
            })
            .select('id', 'createdAt', 'name', 'description', 'price', 'status', 'observation')
            .orderBy('createdAt', 'desc')
            .paginate(per_page, page, true)
            .then(products => res.json(products))
            .catch(err => res.status(500).send(err))
    }

    const getProductPending = (req, res) => {
        app.db('products')
            .where({ status: 'pending' })
            .first()
            .select('id', 'createdAt', 'name', 'description', 'price', 'status', 'observation')
            .then(products => res.json(products))
            .catch(err => res.status(500).send(err))
    }

    return { saveProduct, getProducts, saveResponse, getProductPending }
}