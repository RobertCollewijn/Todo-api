/**
 * Created by Robert on 20-9-2016.
 */

module.exports = function (sequelize, DataTypes){
    return sequelize.define('user',{
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate:{
                isEmail:true
            }

        },
        password:{
            type: DataTypes.STRING,
            allowNull:false,
            validate:{
                len:[7,100]
            }
        }
    })
}
