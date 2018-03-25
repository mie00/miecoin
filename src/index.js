var app = require('./app')
var config = require('config')

const port = config.get('api.port')
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
