const Product = require('../models/product')


const getAllProducts = async (req,res)=>{
     const{featured,company,name,sort,fields,numericFilters} = req.query
     const queryObject ={}
     if(featured){
          queryObject.featured = featured ==='true' ? true : false
     }
     if(company){
          queryObject.company = company
     }
     if(name){
          queryObject.name = {$regex:name , $options:'i'}
     }
     // NumericFilterRegex
     if(numericFilters){
          const operatorMap ={
               '>':'$gt',
               '>=':'$gte',
               '=':'$eq',
               '<':'$lt',
               '<=':'$lte',
          }
          const regEx = /\b(<|>|<=|>=|=)\b/g
          let filters = numericFilters.replace(regex,(match)=>`-${operatorMap[match]}-`)
          // console.log(filters)
          const options = ['price','rating']
          filters = filters.split(',').forEach(element => {
               const [field,operator,value] = element.split('-')
               if(options.includes(field)){
                    queryObject[field]={[operator]:Number(value)}
               }
          });
     }
     // console.log(queryObject)
     const results =  Product.find(queryObject)
     // sort
     if(sort){
          const sortList = sort.split(',').join(' ')
          results = results.sort(sortList)
     }else{
          results = results.sort('createdAt')
     }
     // select Option
     if(fields){
          const fieldsList = fields.split(',').join(' ')
          results = results .select(fieldsList) 
     }
     // pagination
     const page = Number(req.query.page)||1
     const limit = Number(req.query.limit)||10
     const skip = (page - 1)*limit
     results = results.skip(skip).limit(limit)

     const products = await results
     res.status(200).json({products,nbHits:products.length})
}

module.exports= {
     getAllProducts
}
