const fs = require('fs');
const path = require('path')

const dir = path.dirname('folder/new/text.txt');

fs.mkdirSync( dir, { recursive: true })

const data = 'save to file'
fs.writeFile('folder/new/text.txt', data, err => {
	console.log(err)
})
