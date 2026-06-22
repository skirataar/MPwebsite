// Connection
export { connectDB } from './connection';
export { default as clientPromise } from './mongodb';

// Models
export { User }        from './models/User';
export { Product }     from './models/Product';
export { Like }        from './models/Like';
export { CartItem }    from './models/CartItem';
export { Order }       from './models/Order';
export { Video }       from './models/Video';
export { FeatureFlag } from './models/FeatureFlag';

// Types
export type { IUser, UserRole }          from './models/User';
export type { IProduct, ProductStatus }  from './models/Product';
export type { ILike }                    from './models/Like';
export type { ICartItem }                from './models/CartItem';
export type { IOrder, OrderStatus }      from './models/Order';
export type { IVideo }                   from './models/Video';
export type { IFeatureFlag }             from './models/FeatureFlag';
