const express = require('express');
const mysql = require('mysql2');
const app = express();
const multer=require('multer')

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));


app.use(express.static('public'));
const storage= multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null,'public/images');
    },
    filename:(req,file, cb)=>{
        cb(null,file.originalname);
    }
})
const upload= multer({storage:storage});

const port = 3000;

//create a database
// Create MySQL connection
const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_flower',
    password: '@?Mv6bKRkpFsz5m',
    database: 'freedb_C237_Miniproject'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/', (req, res) => {
    res.render('index', {});
});
  
app.get('/List', (req, res) => {
    const sql = 'SELECT * FROM flowers';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving products');
        }
        res.render('List', { flowers: results });
    });
});

app.get('/cart', (req, res) => {
    const sql = 'SELECT * FROM cart';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving products');
        }
        res.render('cart', { cart: results });
    });
});
app.get('/addflower', (req, res) => {
    res.render('addflower');
});

app.post('/addflower', upload.single('image'),(req, res) => {
    const { name, quantity, price } = req.body;
    let image;  
    if(req.file){
        image=req.file.filename;
    } else {
        image = null;
    }

    const sql = 'INSERT INTO flowers (name, quantity, price, image) VALUES (?, ?, ?, ?)';

    connection.query(sql, [name, quantity, price, image], (error, results) => {
        if (error) {
            console.error('Error adding flower:', error);
            res.status(500).send('Error adding flower');
        } else {
            res.redirect('/list');
        }
    });
});

app.get('/editflower/:id', (req, res) => {
    const Flowerid = req.params.id;
    const sql = 'SELECT * FROM flowers WHERE Flowerid = ?';
    connection.query(sql, [Flowerid], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving flower by ID');
        }

        if (results.length > 0) {
            res.render('editflower', { flower: results[0] });
        } else {
            res.status(404).send('Flower not found');
        }
    });
});

app.post('/editflower/:id', upload.single('image'), (req, res) => {
    const Flowerid = req.params.id;
    const { name, quantity, price } = req.body;
    let image = req.body.currentImage;
    if (req.file) {
        image = req.file.filename;
    }
    const sql = 'UPDATE flowers SET name = ?, quantity = ?, price = ?, image = ? WHERE Flowerid = ?';
    connection.query(sql, [name, quantity, price, image, Flowerid], (error, results) => {
        if (error) {
            console.error('Error updating flower:', error);
            res.status(500).send('Error updating flower');
        } else {
            res.redirect('/');
        }
    });
});




app.get('/deleteFlower/:id', (req, res) => {
    const Flowerid = req.params.id;
    const sql = 'DELETE FROM flowers WHERE Flowerid = ?';
    connection.query(sql, [Flowerid], (error, results) => {
        if (error) {
            console.error('Error deleting product:', error);
            return res.status(500).send('Error deleting product');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/deleteFlowercart/:id', (req, res) => {
    const Cartid = req.params.id;
    const sql = 'DELETE FROM cart WHERE Cartid = ?';
    connection.query(sql, [Cartid], (error, results) => {
        if (error) {
            console.error('Error deleting product:', error);
            return res.status(500).send('Error deleting product');
        } else {
            res.redirect('/cart');
        }
    });
});

app.get('/detail/:id', (req, res) => {
    const Flowerid = req.params.id;
    const sql = 'SELECT * FROM flowers WHERE Flowerid = ?';

    connection.query(sql, [Flowerid], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving product by ID');
        }

        if (results.length > 0) {
            res.render('detail', { Flower: results[0] });
        } else {
            res.status(404).send('flower not found');
        }
    });
});



// Handle POST request to add flower to cart from detail page
app.post('/detail/:id/addtocart', (req, res) => {
    const Flowerid = req.params.id;

    const selectsql = 'SELECT name, quantity, price, image FROM flowers WHERE Flowerid = ?';
    connection.query(selectsql, [Flowerid], (error, results) => {
        if (error) {
            console.error('Error retrieving flower details:', error.message);
            return res.status(500).send('Error retrieving flower by ID');
        }
        if (results.length === 0) {
            return res.status(404).send('Flower not found');
        }

        const { name, image, price, quantity } = results[0];

        // Insert flower details into cart table
        const insertsql = 'INSERT INTO cart (name, image, price, quantity) VALUES (?, ?, ?, ?)';
        connection.query(insertsql, [name, image, price, quantity], (error, results) => {
            if (error) {
                console.error('Error adding flower to cart:', error.message);
                return res.status(500).send('Error adding flower to cart');
            } else {
                res.redirect('/'); // Redirect to home or cart page after adding to cart
            }
        });
    });
});

app.post('/List/:id/addtocart', (req, res) => {
    const Flowerid = req.params.id;

    const selectsql = 'SELECT name, quantity, price, image FROM flowers WHERE Flowerid = ?';
    connection.query(selectsql, [Flowerid], (error, results) => {
        if (error) {
            console.error('Error retrieving flower details:', error.message);
            return res.status(500).send('Error retrieving flower by ID');
        }
        if (results.length === 0) {
            return res.status(404).send('Flower not found');
        }

        const { name, image, price, quantity } = results[0];

        // Insert flower details into cart table
        const insertsql = 'INSERT INTO cart (name, image, price, quantity) VALUES (?, ?, ?, ?)';
        connection.query(insertsql, [name, image, price, quantity], (error, results) => {
            if (error) {
                console.error('Error adding flower to cart:', error.message);
                return res.status(500).send('Error adding flower to cart');
            } else {
                res.redirect('/'); // Redirect to home or cart page after adding to cart
            }
        });
    });
});

//Chat GPT (question can you change the seach bar into when search the flower name it will be redirected to the flower detail)
//It this takes
app.get('/search', (req, res) => {
    const { search } = req.query;
    const sql = 'SELECT * FROM flowers WHERE name LIKE ?';
    connection.query(sql, [`%${search}%`], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error searching for flowers');
        }
        if (results.length > 0) {
            res.redirect(`/detail/${results[0].Flowerid}`);
        } else {
            res.send('No flower found with that name');
        }
    });
});
//end

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
  