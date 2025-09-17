import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {

    const exceptions = [environment.VIA_CEP_API];

    for (const exception of exceptions) {
        if (req.url.includes(exception)) {
            return next(req);
        }
    }

    const reqWithCredentials = req.clone({
        withCredentials: true 
    });

    return next(reqWithCredentials);
};