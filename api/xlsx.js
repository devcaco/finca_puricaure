const reader = require('xlsx')

const file = reader.readFile('./stock.xlsx')

let data = []

const sheets = file.SheetNames

