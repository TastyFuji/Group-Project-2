exports.register = async(req,res)=> {

    try {
        
        const { email, password } = req.body

        //step 1 validate body
        if(!email) {

            return res.status(400).json({ message: 'Email is required!!!'})

        }
        if(!password) {

            return res.status(400).json({ message: 'Password is required!!!'})

        }

        //step 2 check email in DB

        console.log(email,password)
        res.send('Hello Register In Controller')

    } catch (err) {
        
        console.log(err)
        res.status(500).json({ message: "Server Error"})

    }

}

exports.login = async(req,res) => {

    try {
        
        res.send('Hello Login In Controller')

    } catch (err) {
        
        console.log(err)
        res.status(500).json({ message: "Server Error"})

    }

}
exports.currentUser = async(req,res) => {

    try {
        
        res.send('Hello CurrentUser In Controller')

    } catch (err) {
        
        console.log(err)
        res.status(500).json({ message: "Server Error"})

    }

}
exports.currentAdmin = async(req,res) => {

    try {
        
        res.send('Hello CurrentAdmin In Controller')

    } catch (err) {
        
        console.log(err)
        res.status(500).json({ message: "Server Error"})

    }

}