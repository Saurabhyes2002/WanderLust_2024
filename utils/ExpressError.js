class ExpressError extends Error{
    constructor( statusCode,message){
        super();
        this.statusCode=statuscode;
        this.message=message;
    }
}
module.exports= ExpressError;