const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')


const app = express()

app.use(cors())
app.use(bodyParser.json())


app.post('/split-payments/compute' , (req, res) => {
    const request = req.body
    let balance = request.Amount
    const splitArray = request.SplitInfo
    const resArray = []

    const flats = splitArray.filter(split =>  split.SplitType === "FLAT")
    const percentages = splitArray.filter(split => split.SplitType === "PERCENTAGE" )
    const ratios = splitArray.filter(split => split.SplitType === "RATIO")

    if(flats)
    {
        flats.forEach(flat => {
            resArray.push({
                SplitEntityId : flat.SplitEntityId,
                Amount : flat.SplitValue
            })
            balance -= flat.SplitValue
        })
    }

    if(percentages)
    {
        percentages.forEach(per => {
            resArray.push({
                SplitEntityId : per.SplitEntityId,
                Amount : (per.SplitValue / 100) * balance
            })
            balance -= ((per.SplitValue / 100) * balance)
        })
    }

    if(ratios)
    {
        const ratioSum = ratios.reduce((a, b) => a + b.SplitValue, 0)

        let ratioamount = 0;
        ratios.forEach(ratio => {
            resArray.push({
                SplitEntityId : ratio.SplitEntityId,
                Amount : (ratio.SplitValue / ratioSum) * balance
            })
            ratioamount +=  ((ratio.SplitValue / ratioSum) * balance)
        })
        
        balance -= ratioamount
    }


    res.json({
        ID : request.ID,
        Balance : balance,
        SplitBreakdown : resArray,
    })

})



app.listen(5000, () => {
    console.log("app is running on port 5000")
})