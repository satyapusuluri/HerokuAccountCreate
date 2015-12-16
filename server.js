var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

var app = express();

app.set('port', process.env.PORT || 5000);

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/update', function(req, res) {
    pg.connect(process.env.DATABASE_URL, function (err, conn, done) {
        // watch for any connect issues
        if (err) console.log(err);
        conn.query(
            'UPDATE salesforce.Account SET Phone = $1, BillingCity = $2, BillingCountry = $3, BillingState = $4, BillingStreet = $5, ShippingCity = $2,ShippingCountry = $3,ShippingState = $4,ShippingStreet = $5 WHERE LOWER(Name) = LOWER($6) AND Phone = $1',
            [req.body.phone.trim(), req.body.BillingCity.trim(), req.body.BillingCountry.trim(), req.body.BillingState.trim(), req.body.BillingStreet.trim(), req.body.AccountName.trim()],
            function(err, result) {
                if (err != null || result.rowCount == 0) {
                  conn.query('INSERT INTO salesforce.Account (Phone, BillingCity, BillingCountry, BillingState, BillingStreet, ShippingCity,ShippingCountry,ShippingState,ShippingStreet, Name ) VALUES ($1, $2, $3, $4, $5, $2, $3, $4, $5, $6)',
                  [req.body.phone.trim(), req.body.BillingCity.trim(), req.body.BillingCountry.trim(), req.body.BillingState.trim(), req.body.BillingStreet.trim(), req.body.AccountName.trim()],
                  function(err, result) {
                    done();
                    if (err) {
                        res.status(400).json({error: err.message});
                    }
                    else {
                        // this will still cause jquery to display 'Record updated!'
                        // eventhough it was inserted
                        res.json(result);
                    }
                  });
                }
                else {
                    done();
                    res.json(result);
                }
            }
        );
    });
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
