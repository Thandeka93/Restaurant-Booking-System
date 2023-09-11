import express from "express";
import pgp from "pg-promise";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import flash from "express-flash";
import session from "express-session";
import pgPromise from "pg-promise";
import restaurant from "./services/restaurant.js";

const app = express()

const connectionString = process.env.PGDATABASE_URL || 'postgres://ronwtcyb:wybzG-lJSU1S94WCmaOs5Abh49P8dahJ@dumbo.db.elephantsql.com/ronwtcyb';
const pgPro = pgPromise();
const db = pgPro(connectionString)

const restaurantAPI = restaurant(db);

app.use(express.static('public'));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});

app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

// Configure express-session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.get("/", async (req, res) => {
    const tables = await restaurantAPI.getTables();
    res.render('index', { tables : [{}, {}, {booked : true}, {}, {}, {}]})
});


app.get("/bookings", (req, res) => {
    res.render('bookings', { tables : [{}, {}, {}, {}, {}, {}]})
});


app.post("/book", async (req, res) => {
    // GET the username, phone number and booking size
    const { username, phone_number, booking_size } = req.body;

    // INSERT booking details into the factory function
    await restaurantAPI.bookTable({
        username,
        phone_number,
        booking_size
    });

    // GET back to the home route
    res.redirect("/");
});


var portNumber = process.env.PORT || 3000;

//start everything up
app.listen(portNumber, function () {
    console.log('🚀  server listening on:', portNumber);
});