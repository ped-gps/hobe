import { IMCCategory } from "../enums/imc-category";

export abstract class IMCUtils {

    static getCategory = (imc: number): IMCCategory => {
        
        if (imc < 18.5) {
            return IMCCategory.UNDERWEIGHT;
        } 
        
        if (imc >= 18.5 && imc < 24.9) {
            return IMCCategory.NORMAL;
        } 
        
        if (imc >= 25 && imc < 29.9) {
            return IMCCategory.OVERWEIGHT;
        } 
        
        if (imc >= 30 && imc < 34.9) {
            return IMCCategory.OBESITY_GRADE_1;
        } 
        
        if (imc >= 35 && imc < 39.9) {
            return IMCCategory.OBESITY_GRADE_2;
        } 
        
        if (imc >= 40) {
            return IMCCategory.OBESITY_GRADE_3;
        } 
        
        return IMCCategory.INVALID;
    }
}
