
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model SuperAdmin
 * 
 */
export type SuperAdmin = $Result.DefaultSelection<Prisma.$SuperAdminPayload>
/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model SubscriptionPlan
 * 
 */
export type SubscriptionPlan = $Result.DefaultSelection<Prisma.$SubscriptionPlanPayload>
/**
 * Model PortalSubscription
 * 
 */
export type PortalSubscription = $Result.DefaultSelection<Prisma.$PortalSubscriptionPayload>
/**
 * Model PortalPayment
 * 
 */
export type PortalPayment = $Result.DefaultSelection<Prisma.$PortalPaymentPayload>
/**
 * Model SaasAdmin
 * 
 */
export type SaasAdmin = $Result.DefaultSelection<Prisma.$SaasAdminPayload>
/**
 * Model AppSetting
 * 
 */
export type AppSetting = $Result.DefaultSelection<Prisma.$AppSettingPayload>
/**
 * Model ActivationKey
 * 
 */
export type ActivationKey = $Result.DefaultSelection<Prisma.$ActivationKeyPayload>
/**
 * Model ActivationDevice
 * 
 */
export type ActivationDevice = $Result.DefaultSelection<Prisma.$ActivationDevicePayload>
/**
 * Model ClientDevice
 * 
 */
export type ClientDevice = $Result.DefaultSelection<Prisma.$ClientDevicePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  MASTER_ADMIN: 'MASTER_ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more SuperAdmins
 * const superAdmins = await prisma.superAdmin.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more SuperAdmins
   * const superAdmins = await prisma.superAdmin.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.superAdmin`: Exposes CRUD operations for the **SuperAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SuperAdmins
    * const superAdmins = await prisma.superAdmin.findMany()
    * ```
    */
  get superAdmin(): Prisma.SuperAdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.subscriptionPlan`: Exposes CRUD operations for the **SubscriptionPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SubscriptionPlans
    * const subscriptionPlans = await prisma.subscriptionPlan.findMany()
    * ```
    */
  get subscriptionPlan(): Prisma.SubscriptionPlanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.portalSubscription`: Exposes CRUD operations for the **PortalSubscription** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PortalSubscriptions
    * const portalSubscriptions = await prisma.portalSubscription.findMany()
    * ```
    */
  get portalSubscription(): Prisma.PortalSubscriptionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.portalPayment`: Exposes CRUD operations for the **PortalPayment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PortalPayments
    * const portalPayments = await prisma.portalPayment.findMany()
    * ```
    */
  get portalPayment(): Prisma.PortalPaymentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.saasAdmin`: Exposes CRUD operations for the **SaasAdmin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SaasAdmins
    * const saasAdmins = await prisma.saasAdmin.findMany()
    * ```
    */
  get saasAdmin(): Prisma.SaasAdminDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.appSetting`: Exposes CRUD operations for the **AppSetting** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppSettings
    * const appSettings = await prisma.appSetting.findMany()
    * ```
    */
  get appSetting(): Prisma.AppSettingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.activationKey`: Exposes CRUD operations for the **ActivationKey** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ActivationKeys
    * const activationKeys = await prisma.activationKey.findMany()
    * ```
    */
  get activationKey(): Prisma.ActivationKeyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.activationDevice`: Exposes CRUD operations for the **ActivationDevice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ActivationDevices
    * const activationDevices = await prisma.activationDevice.findMany()
    * ```
    */
  get activationDevice(): Prisma.ActivationDeviceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.clientDevice`: Exposes CRUD operations for the **ClientDevice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClientDevices
    * const clientDevices = await prisma.clientDevice.findMany()
    * ```
    */
  get clientDevice(): Prisma.ClientDeviceDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    SuperAdmin: 'SuperAdmin',
    Tenant: 'Tenant',
    SubscriptionPlan: 'SubscriptionPlan',
    PortalSubscription: 'PortalSubscription',
    PortalPayment: 'PortalPayment',
    SaasAdmin: 'SaasAdmin',
    AppSetting: 'AppSetting',
    ActivationKey: 'ActivationKey',
    ActivationDevice: 'ActivationDevice',
    ClientDevice: 'ClientDevice'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "superAdmin" | "tenant" | "subscriptionPlan" | "portalSubscription" | "portalPayment" | "saasAdmin" | "appSetting" | "activationKey" | "activationDevice" | "clientDevice"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      SuperAdmin: {
        payload: Prisma.$SuperAdminPayload<ExtArgs>
        fields: Prisma.SuperAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SuperAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SuperAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findFirst: {
            args: Prisma.SuperAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SuperAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          findMany: {
            args: Prisma.SuperAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          create: {
            args: Prisma.SuperAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          createMany: {
            args: Prisma.SuperAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SuperAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          delete: {
            args: Prisma.SuperAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          update: {
            args: Prisma.SuperAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          deleteMany: {
            args: Prisma.SuperAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SuperAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SuperAdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>[]
          }
          upsert: {
            args: Prisma.SuperAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SuperAdminPayload>
          }
          aggregate: {
            args: Prisma.SuperAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSuperAdmin>
          }
          groupBy: {
            args: Prisma.SuperAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.SuperAdminCountArgs<ExtArgs>
            result: $Utils.Optional<SuperAdminCountAggregateOutputType> | number
          }
        }
      }
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      SubscriptionPlan: {
        payload: Prisma.$SubscriptionPlanPayload<ExtArgs>
        fields: Prisma.SubscriptionPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SubscriptionPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SubscriptionPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          findFirst: {
            args: Prisma.SubscriptionPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SubscriptionPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          findMany: {
            args: Prisma.SubscriptionPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>[]
          }
          create: {
            args: Prisma.SubscriptionPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          createMany: {
            args: Prisma.SubscriptionPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SubscriptionPlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>[]
          }
          delete: {
            args: Prisma.SubscriptionPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          update: {
            args: Prisma.SubscriptionPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          deleteMany: {
            args: Prisma.SubscriptionPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SubscriptionPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SubscriptionPlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>[]
          }
          upsert: {
            args: Prisma.SubscriptionPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SubscriptionPlanPayload>
          }
          aggregate: {
            args: Prisma.SubscriptionPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSubscriptionPlan>
          }
          groupBy: {
            args: Prisma.SubscriptionPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.SubscriptionPlanCountArgs<ExtArgs>
            result: $Utils.Optional<SubscriptionPlanCountAggregateOutputType> | number
          }
        }
      }
      PortalSubscription: {
        payload: Prisma.$PortalSubscriptionPayload<ExtArgs>
        fields: Prisma.PortalSubscriptionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PortalSubscriptionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PortalSubscriptionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>
          }
          findFirst: {
            args: Prisma.PortalSubscriptionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PortalSubscriptionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>
          }
          findMany: {
            args: Prisma.PortalSubscriptionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>[]
          }
          create: {
            args: Prisma.PortalSubscriptionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>
          }
          createMany: {
            args: Prisma.PortalSubscriptionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PortalSubscriptionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>[]
          }
          delete: {
            args: Prisma.PortalSubscriptionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>
          }
          update: {
            args: Prisma.PortalSubscriptionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>
          }
          deleteMany: {
            args: Prisma.PortalSubscriptionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PortalSubscriptionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PortalSubscriptionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>[]
          }
          upsert: {
            args: Prisma.PortalSubscriptionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalSubscriptionPayload>
          }
          aggregate: {
            args: Prisma.PortalSubscriptionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePortalSubscription>
          }
          groupBy: {
            args: Prisma.PortalSubscriptionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PortalSubscriptionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PortalSubscriptionCountArgs<ExtArgs>
            result: $Utils.Optional<PortalSubscriptionCountAggregateOutputType> | number
          }
        }
      }
      PortalPayment: {
        payload: Prisma.$PortalPaymentPayload<ExtArgs>
        fields: Prisma.PortalPaymentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PortalPaymentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PortalPaymentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>
          }
          findFirst: {
            args: Prisma.PortalPaymentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PortalPaymentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>
          }
          findMany: {
            args: Prisma.PortalPaymentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>[]
          }
          create: {
            args: Prisma.PortalPaymentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>
          }
          createMany: {
            args: Prisma.PortalPaymentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PortalPaymentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>[]
          }
          delete: {
            args: Prisma.PortalPaymentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>
          }
          update: {
            args: Prisma.PortalPaymentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>
          }
          deleteMany: {
            args: Prisma.PortalPaymentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PortalPaymentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PortalPaymentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>[]
          }
          upsert: {
            args: Prisma.PortalPaymentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PortalPaymentPayload>
          }
          aggregate: {
            args: Prisma.PortalPaymentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePortalPayment>
          }
          groupBy: {
            args: Prisma.PortalPaymentGroupByArgs<ExtArgs>
            result: $Utils.Optional<PortalPaymentGroupByOutputType>[]
          }
          count: {
            args: Prisma.PortalPaymentCountArgs<ExtArgs>
            result: $Utils.Optional<PortalPaymentCountAggregateOutputType> | number
          }
        }
      }
      SaasAdmin: {
        payload: Prisma.$SaasAdminPayload<ExtArgs>
        fields: Prisma.SaasAdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SaasAdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SaasAdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>
          }
          findFirst: {
            args: Prisma.SaasAdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SaasAdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>
          }
          findMany: {
            args: Prisma.SaasAdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>[]
          }
          create: {
            args: Prisma.SaasAdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>
          }
          createMany: {
            args: Prisma.SaasAdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SaasAdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>[]
          }
          delete: {
            args: Prisma.SaasAdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>
          }
          update: {
            args: Prisma.SaasAdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>
          }
          deleteMany: {
            args: Prisma.SaasAdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SaasAdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SaasAdminUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>[]
          }
          upsert: {
            args: Prisma.SaasAdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaasAdminPayload>
          }
          aggregate: {
            args: Prisma.SaasAdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSaasAdmin>
          }
          groupBy: {
            args: Prisma.SaasAdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<SaasAdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.SaasAdminCountArgs<ExtArgs>
            result: $Utils.Optional<SaasAdminCountAggregateOutputType> | number
          }
        }
      }
      AppSetting: {
        payload: Prisma.$AppSettingPayload<ExtArgs>
        fields: Prisma.AppSettingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AppSettingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AppSettingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>
          }
          findFirst: {
            args: Prisma.AppSettingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AppSettingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>
          }
          findMany: {
            args: Prisma.AppSettingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>[]
          }
          create: {
            args: Prisma.AppSettingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>
          }
          createMany: {
            args: Prisma.AppSettingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AppSettingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>[]
          }
          delete: {
            args: Prisma.AppSettingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>
          }
          update: {
            args: Prisma.AppSettingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>
          }
          deleteMany: {
            args: Prisma.AppSettingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AppSettingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AppSettingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>[]
          }
          upsert: {
            args: Prisma.AppSettingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AppSettingPayload>
          }
          aggregate: {
            args: Prisma.AppSettingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAppSetting>
          }
          groupBy: {
            args: Prisma.AppSettingGroupByArgs<ExtArgs>
            result: $Utils.Optional<AppSettingGroupByOutputType>[]
          }
          count: {
            args: Prisma.AppSettingCountArgs<ExtArgs>
            result: $Utils.Optional<AppSettingCountAggregateOutputType> | number
          }
        }
      }
      ActivationKey: {
        payload: Prisma.$ActivationKeyPayload<ExtArgs>
        fields: Prisma.ActivationKeyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivationKeyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivationKeyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>
          }
          findFirst: {
            args: Prisma.ActivationKeyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivationKeyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>
          }
          findMany: {
            args: Prisma.ActivationKeyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>[]
          }
          create: {
            args: Prisma.ActivationKeyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>
          }
          createMany: {
            args: Prisma.ActivationKeyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ActivationKeyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>[]
          }
          delete: {
            args: Prisma.ActivationKeyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>
          }
          update: {
            args: Prisma.ActivationKeyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>
          }
          deleteMany: {
            args: Prisma.ActivationKeyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivationKeyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ActivationKeyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>[]
          }
          upsert: {
            args: Prisma.ActivationKeyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationKeyPayload>
          }
          aggregate: {
            args: Prisma.ActivationKeyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivationKey>
          }
          groupBy: {
            args: Prisma.ActivationKeyGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivationKeyGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivationKeyCountArgs<ExtArgs>
            result: $Utils.Optional<ActivationKeyCountAggregateOutputType> | number
          }
        }
      }
      ActivationDevice: {
        payload: Prisma.$ActivationDevicePayload<ExtArgs>
        fields: Prisma.ActivationDeviceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivationDeviceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivationDeviceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>
          }
          findFirst: {
            args: Prisma.ActivationDeviceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivationDeviceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>
          }
          findMany: {
            args: Prisma.ActivationDeviceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>[]
          }
          create: {
            args: Prisma.ActivationDeviceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>
          }
          createMany: {
            args: Prisma.ActivationDeviceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ActivationDeviceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>[]
          }
          delete: {
            args: Prisma.ActivationDeviceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>
          }
          update: {
            args: Prisma.ActivationDeviceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>
          }
          deleteMany: {
            args: Prisma.ActivationDeviceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivationDeviceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ActivationDeviceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>[]
          }
          upsert: {
            args: Prisma.ActivationDeviceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivationDevicePayload>
          }
          aggregate: {
            args: Prisma.ActivationDeviceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivationDevice>
          }
          groupBy: {
            args: Prisma.ActivationDeviceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivationDeviceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivationDeviceCountArgs<ExtArgs>
            result: $Utils.Optional<ActivationDeviceCountAggregateOutputType> | number
          }
        }
      }
      ClientDevice: {
        payload: Prisma.$ClientDevicePayload<ExtArgs>
        fields: Prisma.ClientDeviceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClientDeviceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClientDeviceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>
          }
          findFirst: {
            args: Prisma.ClientDeviceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClientDeviceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>
          }
          findMany: {
            args: Prisma.ClientDeviceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>[]
          }
          create: {
            args: Prisma.ClientDeviceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>
          }
          createMany: {
            args: Prisma.ClientDeviceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClientDeviceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>[]
          }
          delete: {
            args: Prisma.ClientDeviceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>
          }
          update: {
            args: Prisma.ClientDeviceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>
          }
          deleteMany: {
            args: Prisma.ClientDeviceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClientDeviceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClientDeviceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>[]
          }
          upsert: {
            args: Prisma.ClientDeviceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientDevicePayload>
          }
          aggregate: {
            args: Prisma.ClientDeviceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClientDevice>
          }
          groupBy: {
            args: Prisma.ClientDeviceGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClientDeviceGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClientDeviceCountArgs<ExtArgs>
            result: $Utils.Optional<ClientDeviceCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    superAdmin?: SuperAdminOmit
    tenant?: TenantOmit
    subscriptionPlan?: SubscriptionPlanOmit
    portalSubscription?: PortalSubscriptionOmit
    portalPayment?: PortalPaymentOmit
    saasAdmin?: SaasAdminOmit
    appSetting?: AppSettingOmit
    activationKey?: ActivationKeyOmit
    activationDevice?: ActivationDeviceOmit
    clientDevice?: ClientDeviceOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ActivationKeyCountOutputType
   */

  export type ActivationKeyCountOutputType = {
    devices: number
  }

  export type ActivationKeyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    devices?: boolean | ActivationKeyCountOutputTypeCountDevicesArgs
  }

  // Custom InputTypes
  /**
   * ActivationKeyCountOutputType without action
   */
  export type ActivationKeyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKeyCountOutputType
     */
    select?: ActivationKeyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ActivationKeyCountOutputType without action
   */
  export type ActivationKeyCountOutputTypeCountDevicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivationDeviceWhereInput
  }


  /**
   * Models
   */

  /**
   * Model SuperAdmin
   */

  export type AggregateSuperAdmin = {
    _count: SuperAdminCountAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  export type SuperAdminMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    contact: string | null
    position: string | null
    country: string | null
    state: string | null
    city: string | null
    zipCode: string | null
    fullAddress: string | null
    createdAt: Date | null
    currentSessionToken: string | null
    lastLoginAt: Date | null
    role: $Enums.Role | null
    basicComplete: boolean | null
    addressComplete: boolean | null
  }

  export type SuperAdminMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    contact: string | null
    position: string | null
    country: string | null
    state: string | null
    city: string | null
    zipCode: string | null
    fullAddress: string | null
    createdAt: Date | null
    currentSessionToken: string | null
    lastLoginAt: Date | null
    role: $Enums.Role | null
    basicComplete: boolean | null
    addressComplete: boolean | null
  }

  export type SuperAdminCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    contact: number
    position: number
    country: number
    state: number
    city: number
    zipCode: number
    fullAddress: number
    createdAt: number
    currentSessionToken: number
    lastLoginAt: number
    role: number
    basicComplete: number
    addressComplete: number
    _all: number
  }


  export type SuperAdminMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    contact?: true
    position?: true
    country?: true
    state?: true
    city?: true
    zipCode?: true
    fullAddress?: true
    createdAt?: true
    currentSessionToken?: true
    lastLoginAt?: true
    role?: true
    basicComplete?: true
    addressComplete?: true
  }

  export type SuperAdminMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    contact?: true
    position?: true
    country?: true
    state?: true
    city?: true
    zipCode?: true
    fullAddress?: true
    createdAt?: true
    currentSessionToken?: true
    lastLoginAt?: true
    role?: true
    basicComplete?: true
    addressComplete?: true
  }

  export type SuperAdminCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    contact?: true
    position?: true
    country?: true
    state?: true
    city?: true
    zipCode?: true
    fullAddress?: true
    createdAt?: true
    currentSessionToken?: true
    lastLoginAt?: true
    role?: true
    basicComplete?: true
    addressComplete?: true
    _all?: true
  }

  export type SuperAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmin to aggregate.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SuperAdmins
    **/
    _count?: true | SuperAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SuperAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SuperAdminMaxAggregateInputType
  }

  export type GetSuperAdminAggregateType<T extends SuperAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateSuperAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSuperAdmin[P]>
      : GetScalarType<T[P], AggregateSuperAdmin[P]>
  }




  export type SuperAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SuperAdminWhereInput
    orderBy?: SuperAdminOrderByWithAggregationInput | SuperAdminOrderByWithAggregationInput[]
    by: SuperAdminScalarFieldEnum[] | SuperAdminScalarFieldEnum
    having?: SuperAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SuperAdminCountAggregateInputType | true
    _min?: SuperAdminMinAggregateInputType
    _max?: SuperAdminMaxAggregateInputType
  }

  export type SuperAdminGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    contact: string | null
    position: string
    country: string | null
    state: string | null
    city: string | null
    zipCode: string | null
    fullAddress: string | null
    createdAt: Date
    currentSessionToken: string | null
    lastLoginAt: Date | null
    role: $Enums.Role
    basicComplete: boolean
    addressComplete: boolean
    _count: SuperAdminCountAggregateOutputType | null
    _min: SuperAdminMinAggregateOutputType | null
    _max: SuperAdminMaxAggregateOutputType | null
  }

  type GetSuperAdminGroupByPayload<T extends SuperAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SuperAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SuperAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
            : GetScalarType<T[P], SuperAdminGroupByOutputType[P]>
        }
      >
    >


  export type SuperAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    contact?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    currentSessionToken?: boolean
    lastLoginAt?: boolean
    role?: boolean
    basicComplete?: boolean
    addressComplete?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    contact?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    currentSessionToken?: boolean
    lastLoginAt?: boolean
    role?: boolean
    basicComplete?: boolean
    addressComplete?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    contact?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    currentSessionToken?: boolean
    lastLoginAt?: boolean
    role?: boolean
    basicComplete?: boolean
    addressComplete?: boolean
  }, ExtArgs["result"]["superAdmin"]>

  export type SuperAdminSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    contact?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    fullAddress?: boolean
    createdAt?: boolean
    currentSessionToken?: boolean
    lastLoginAt?: boolean
    role?: boolean
    basicComplete?: boolean
    addressComplete?: boolean
  }

  export type SuperAdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "contact" | "position" | "country" | "state" | "city" | "zipCode" | "fullAddress" | "createdAt" | "currentSessionToken" | "lastLoginAt" | "role" | "basicComplete" | "addressComplete", ExtArgs["result"]["superAdmin"]>

  export type $SuperAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SuperAdmin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      contact: string | null
      position: string
      country: string | null
      state: string | null
      city: string | null
      zipCode: string | null
      fullAddress: string | null
      createdAt: Date
      currentSessionToken: string | null
      lastLoginAt: Date | null
      role: $Enums.Role
      basicComplete: boolean
      addressComplete: boolean
    }, ExtArgs["result"]["superAdmin"]>
    composites: {}
  }

  type SuperAdminGetPayload<S extends boolean | null | undefined | SuperAdminDefaultArgs> = $Result.GetResult<Prisma.$SuperAdminPayload, S>

  type SuperAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SuperAdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SuperAdminCountAggregateInputType | true
    }

  export interface SuperAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SuperAdmin'], meta: { name: 'SuperAdmin' } }
    /**
     * Find zero or one SuperAdmin that matches the filter.
     * @param {SuperAdminFindUniqueArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SuperAdminFindUniqueArgs>(args: SelectSubset<T, SuperAdminFindUniqueArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SuperAdmin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SuperAdminFindUniqueOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SuperAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, SuperAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SuperAdminFindFirstArgs>(args?: SelectSubset<T, SuperAdminFindFirstArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SuperAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindFirstOrThrowArgs} args - Arguments to find a SuperAdmin
     * @example
     * // Get one SuperAdmin
     * const superAdmin = await prisma.superAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SuperAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, SuperAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SuperAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany()
     * 
     * // Get first 10 SuperAdmins
     * const superAdmins = await prisma.superAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SuperAdminFindManyArgs>(args?: SelectSubset<T, SuperAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SuperAdmin.
     * @param {SuperAdminCreateArgs} args - Arguments to create a SuperAdmin.
     * @example
     * // Create one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.create({
     *   data: {
     *     // ... data to create a SuperAdmin
     *   }
     * })
     * 
     */
    create<T extends SuperAdminCreateArgs>(args: SelectSubset<T, SuperAdminCreateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SuperAdmins.
     * @param {SuperAdminCreateManyArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SuperAdminCreateManyArgs>(args?: SelectSubset<T, SuperAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SuperAdmins and returns the data saved in the database.
     * @param {SuperAdminCreateManyAndReturnArgs} args - Arguments to create many SuperAdmins.
     * @example
     * // Create many SuperAdmins
     * const superAdmin = await prisma.superAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SuperAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, SuperAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SuperAdmin.
     * @param {SuperAdminDeleteArgs} args - Arguments to delete one SuperAdmin.
     * @example
     * // Delete one SuperAdmin
     * const SuperAdmin = await prisma.superAdmin.delete({
     *   where: {
     *     // ... filter to delete one SuperAdmin
     *   }
     * })
     * 
     */
    delete<T extends SuperAdminDeleteArgs>(args: SelectSubset<T, SuperAdminDeleteArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SuperAdmin.
     * @param {SuperAdminUpdateArgs} args - Arguments to update one SuperAdmin.
     * @example
     * // Update one SuperAdmin
     * const superAdmin = await prisma.superAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SuperAdminUpdateArgs>(args: SelectSubset<T, SuperAdminUpdateArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SuperAdmins.
     * @param {SuperAdminDeleteManyArgs} args - Arguments to filter SuperAdmins to delete.
     * @example
     * // Delete a few SuperAdmins
     * const { count } = await prisma.superAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SuperAdminDeleteManyArgs>(args?: SelectSubset<T, SuperAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SuperAdminUpdateManyArgs>(args: SelectSubset<T, SuperAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SuperAdmins and returns the data updated in the database.
     * @param {SuperAdminUpdateManyAndReturnArgs} args - Arguments to update many SuperAdmins.
     * @example
     * // Update many SuperAdmins
     * const superAdmin = await prisma.superAdmin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SuperAdmins and only return the `id`
     * const superAdminWithIdOnly = await prisma.superAdmin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SuperAdminUpdateManyAndReturnArgs>(args: SelectSubset<T, SuperAdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SuperAdmin.
     * @param {SuperAdminUpsertArgs} args - Arguments to update or create a SuperAdmin.
     * @example
     * // Update or create a SuperAdmin
     * const superAdmin = await prisma.superAdmin.upsert({
     *   create: {
     *     // ... data to create a SuperAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SuperAdmin we want to update
     *   }
     * })
     */
    upsert<T extends SuperAdminUpsertArgs>(args: SelectSubset<T, SuperAdminUpsertArgs<ExtArgs>>): Prisma__SuperAdminClient<$Result.GetResult<Prisma.$SuperAdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SuperAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminCountArgs} args - Arguments to filter SuperAdmins to count.
     * @example
     * // Count the number of SuperAdmins
     * const count = await prisma.superAdmin.count({
     *   where: {
     *     // ... the filter for the SuperAdmins we want to count
     *   }
     * })
    **/
    count<T extends SuperAdminCountArgs>(
      args?: Subset<T, SuperAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SuperAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SuperAdminAggregateArgs>(args: Subset<T, SuperAdminAggregateArgs>): Prisma.PrismaPromise<GetSuperAdminAggregateType<T>>

    /**
     * Group by SuperAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SuperAdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SuperAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SuperAdminGroupByArgs['orderBy'] }
        : { orderBy?: SuperAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SuperAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSuperAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SuperAdmin model
   */
  readonly fields: SuperAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SuperAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SuperAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SuperAdmin model
   */
  interface SuperAdminFieldRefs {
    readonly id: FieldRef<"SuperAdmin", 'String'>
    readonly name: FieldRef<"SuperAdmin", 'String'>
    readonly email: FieldRef<"SuperAdmin", 'String'>
    readonly password: FieldRef<"SuperAdmin", 'String'>
    readonly contact: FieldRef<"SuperAdmin", 'String'>
    readonly position: FieldRef<"SuperAdmin", 'String'>
    readonly country: FieldRef<"SuperAdmin", 'String'>
    readonly state: FieldRef<"SuperAdmin", 'String'>
    readonly city: FieldRef<"SuperAdmin", 'String'>
    readonly zipCode: FieldRef<"SuperAdmin", 'String'>
    readonly fullAddress: FieldRef<"SuperAdmin", 'String'>
    readonly createdAt: FieldRef<"SuperAdmin", 'DateTime'>
    readonly currentSessionToken: FieldRef<"SuperAdmin", 'String'>
    readonly lastLoginAt: FieldRef<"SuperAdmin", 'DateTime'>
    readonly role: FieldRef<"SuperAdmin", 'Role'>
    readonly basicComplete: FieldRef<"SuperAdmin", 'Boolean'>
    readonly addressComplete: FieldRef<"SuperAdmin", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * SuperAdmin findUnique
   */
  export type SuperAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findUniqueOrThrow
   */
  export type SuperAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin findFirst
   */
  export type SuperAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findFirstOrThrow
   */
  export type SuperAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmin to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SuperAdmins.
     */
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin findMany
   */
  export type SuperAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter, which SuperAdmins to fetch.
     */
    where?: SuperAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SuperAdmins to fetch.
     */
    orderBy?: SuperAdminOrderByWithRelationInput | SuperAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SuperAdmins.
     */
    cursor?: SuperAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SuperAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SuperAdmins.
     */
    skip?: number
    distinct?: SuperAdminScalarFieldEnum | SuperAdminScalarFieldEnum[]
  }

  /**
   * SuperAdmin create
   */
  export type SuperAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data needed to create a SuperAdmin.
     */
    data: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
  }

  /**
   * SuperAdmin createMany
   */
  export type SuperAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
  }

  /**
   * SuperAdmin createManyAndReturn
   */
  export type SuperAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to create many SuperAdmins.
     */
    data: SuperAdminCreateManyInput | SuperAdminCreateManyInput[]
  }

  /**
   * SuperAdmin update
   */
  export type SuperAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data needed to update a SuperAdmin.
     */
    data: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
    /**
     * Choose, which SuperAdmin to update.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin updateMany
   */
  export type SuperAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin updateManyAndReturn
   */
  export type SuperAdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The data used to update SuperAdmins.
     */
    data: XOR<SuperAdminUpdateManyMutationInput, SuperAdminUncheckedUpdateManyInput>
    /**
     * Filter which SuperAdmins to update
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to update.
     */
    limit?: number
  }

  /**
   * SuperAdmin upsert
   */
  export type SuperAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * The filter to search for the SuperAdmin to update in case it exists.
     */
    where: SuperAdminWhereUniqueInput
    /**
     * In case the SuperAdmin found by the `where` argument doesn't exist, create a new SuperAdmin with this data.
     */
    create: XOR<SuperAdminCreateInput, SuperAdminUncheckedCreateInput>
    /**
     * In case the SuperAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SuperAdminUpdateInput, SuperAdminUncheckedUpdateInput>
  }

  /**
   * SuperAdmin delete
   */
  export type SuperAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
    /**
     * Filter which SuperAdmin to delete.
     */
    where: SuperAdminWhereUniqueInput
  }

  /**
   * SuperAdmin deleteMany
   */
  export type SuperAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SuperAdmins to delete
     */
    where?: SuperAdminWhereInput
    /**
     * Limit how many SuperAdmins to delete.
     */
    limit?: number
  }

  /**
   * SuperAdmin without action
   */
  export type SuperAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SuperAdmin
     */
    select?: SuperAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SuperAdmin
     */
    omit?: SuperAdminOmit<ExtArgs> | null
  }


  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    name: string | null
    contact: string | null
    fullAddress: string | null
    logo: string | null
    certificateName: string | null
    stamp: string | null
    sign: string | null
    position: string | null
    country: string | null
    state: string | null
    city: string | null
    zipCode: string | null
    instituteName: string | null
    tenantId: string | null
    slug: string | null
    email: string | null
    businessEmail: string | null
    password: string | null
    encryptedPassword: string | null
    dbUrl: string | null
    parentTenantId: string | null
    loginCode: string | null
    createdAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    name: string | null
    contact: string | null
    fullAddress: string | null
    logo: string | null
    certificateName: string | null
    stamp: string | null
    sign: string | null
    position: string | null
    country: string | null
    state: string | null
    city: string | null
    zipCode: string | null
    instituteName: string | null
    tenantId: string | null
    slug: string | null
    email: string | null
    businessEmail: string | null
    password: string | null
    encryptedPassword: string | null
    dbUrl: string | null
    parentTenantId: string | null
    loginCode: string | null
    createdAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    name: number
    contact: number
    fullAddress: number
    logo: number
    certificateName: number
    stamp: number
    sign: number
    position: number
    country: number
    state: number
    city: number
    zipCode: number
    instituteName: number
    tenantId: number
    slug: number
    email: number
    businessEmail: number
    password: number
    encryptedPassword: number
    dbUrl: number
    parentTenantId: number
    loginCode: number
    createdAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    name?: true
    contact?: true
    fullAddress?: true
    logo?: true
    certificateName?: true
    stamp?: true
    sign?: true
    position?: true
    country?: true
    state?: true
    city?: true
    zipCode?: true
    instituteName?: true
    tenantId?: true
    slug?: true
    email?: true
    businessEmail?: true
    password?: true
    encryptedPassword?: true
    dbUrl?: true
    parentTenantId?: true
    loginCode?: true
    createdAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    name?: true
    contact?: true
    fullAddress?: true
    logo?: true
    certificateName?: true
    stamp?: true
    sign?: true
    position?: true
    country?: true
    state?: true
    city?: true
    zipCode?: true
    instituteName?: true
    tenantId?: true
    slug?: true
    email?: true
    businessEmail?: true
    password?: true
    encryptedPassword?: true
    dbUrl?: true
    parentTenantId?: true
    loginCode?: true
    createdAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    name?: true
    contact?: true
    fullAddress?: true
    logo?: true
    certificateName?: true
    stamp?: true
    sign?: true
    position?: true
    country?: true
    state?: true
    city?: true
    zipCode?: true
    instituteName?: true
    tenantId?: true
    slug?: true
    email?: true
    businessEmail?: true
    password?: true
    encryptedPassword?: true
    dbUrl?: true
    parentTenantId?: true
    loginCode?: true
    createdAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    name: string
    contact: string
    fullAddress: string
    logo: string | null
    certificateName: string | null
    stamp: string | null
    sign: string | null
    position: string
    country: string
    state: string
    city: string
    zipCode: string
    instituteName: string
    tenantId: string
    slug: string
    email: string | null
    businessEmail: string | null
    password: string | null
    encryptedPassword: string
    dbUrl: string
    parentTenantId: string | null
    loginCode: string | null
    createdAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    contact?: boolean
    fullAddress?: boolean
    logo?: boolean
    certificateName?: boolean
    stamp?: boolean
    sign?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    instituteName?: boolean
    tenantId?: boolean
    slug?: boolean
    email?: boolean
    businessEmail?: boolean
    password?: boolean
    encryptedPassword?: boolean
    dbUrl?: boolean
    parentTenantId?: boolean
    loginCode?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    contact?: boolean
    fullAddress?: boolean
    logo?: boolean
    certificateName?: boolean
    stamp?: boolean
    sign?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    instituteName?: boolean
    tenantId?: boolean
    slug?: boolean
    email?: boolean
    businessEmail?: boolean
    password?: boolean
    encryptedPassword?: boolean
    dbUrl?: boolean
    parentTenantId?: boolean
    loginCode?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    contact?: boolean
    fullAddress?: boolean
    logo?: boolean
    certificateName?: boolean
    stamp?: boolean
    sign?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    instituteName?: boolean
    tenantId?: boolean
    slug?: boolean
    email?: boolean
    businessEmail?: boolean
    password?: boolean
    encryptedPassword?: boolean
    dbUrl?: boolean
    parentTenantId?: boolean
    loginCode?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    name?: boolean
    contact?: boolean
    fullAddress?: boolean
    logo?: boolean
    certificateName?: boolean
    stamp?: boolean
    sign?: boolean
    position?: boolean
    country?: boolean
    state?: boolean
    city?: boolean
    zipCode?: boolean
    instituteName?: boolean
    tenantId?: boolean
    slug?: boolean
    email?: boolean
    businessEmail?: boolean
    password?: boolean
    encryptedPassword?: boolean
    dbUrl?: boolean
    parentTenantId?: boolean
    loginCode?: boolean
    createdAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "contact" | "fullAddress" | "logo" | "certificateName" | "stamp" | "sign" | "position" | "country" | "state" | "city" | "zipCode" | "instituteName" | "tenantId" | "slug" | "email" | "businessEmail" | "password" | "encryptedPassword" | "dbUrl" | "parentTenantId" | "loginCode" | "createdAt", ExtArgs["result"]["tenant"]>

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      contact: string
      fullAddress: string
      logo: string | null
      certificateName: string | null
      stamp: string | null
      sign: string | null
      position: string
      country: string
      state: string
      city: string
      zipCode: string
      instituteName: string
      tenantId: string
      slug: string
      email: string | null
      businessEmail: string | null
      password: string | null
      encryptedPassword: string
      dbUrl: string
      parentTenantId: string | null
      loginCode: string | null
      createdAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly contact: FieldRef<"Tenant", 'String'>
    readonly fullAddress: FieldRef<"Tenant", 'String'>
    readonly logo: FieldRef<"Tenant", 'String'>
    readonly certificateName: FieldRef<"Tenant", 'String'>
    readonly stamp: FieldRef<"Tenant", 'String'>
    readonly sign: FieldRef<"Tenant", 'String'>
    readonly position: FieldRef<"Tenant", 'String'>
    readonly country: FieldRef<"Tenant", 'String'>
    readonly state: FieldRef<"Tenant", 'String'>
    readonly city: FieldRef<"Tenant", 'String'>
    readonly zipCode: FieldRef<"Tenant", 'String'>
    readonly instituteName: FieldRef<"Tenant", 'String'>
    readonly tenantId: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly email: FieldRef<"Tenant", 'String'>
    readonly businessEmail: FieldRef<"Tenant", 'String'>
    readonly password: FieldRef<"Tenant", 'String'>
    readonly encryptedPassword: FieldRef<"Tenant", 'String'>
    readonly dbUrl: FieldRef<"Tenant", 'String'>
    readonly parentTenantId: FieldRef<"Tenant", 'String'>
    readonly loginCode: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
  }


  /**
   * Model SubscriptionPlan
   */

  export type AggregateSubscriptionPlan = {
    _count: SubscriptionPlanCountAggregateOutputType | null
    _avg: SubscriptionPlanAvgAggregateOutputType | null
    _sum: SubscriptionPlanSumAggregateOutputType | null
    _min: SubscriptionPlanMinAggregateOutputType | null
    _max: SubscriptionPlanMaxAggregateOutputType | null
  }

  export type SubscriptionPlanAvgAggregateOutputType = {
    months: number | null
    price: number | null
  }

  export type SubscriptionPlanSumAggregateOutputType = {
    months: number | null
    price: number | null
  }

  export type SubscriptionPlanMinAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    months: number | null
    price: number | null
    currency: string | null
    active: boolean | null
    updatedAt: Date | null
  }

  export type SubscriptionPlanMaxAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    months: number | null
    price: number | null
    currency: string | null
    active: boolean | null
    updatedAt: Date | null
  }

  export type SubscriptionPlanCountAggregateOutputType = {
    id: number
    code: number
    name: number
    months: number
    price: number
    currency: number
    active: number
    updatedAt: number
    _all: number
  }


  export type SubscriptionPlanAvgAggregateInputType = {
    months?: true
    price?: true
  }

  export type SubscriptionPlanSumAggregateInputType = {
    months?: true
    price?: true
  }

  export type SubscriptionPlanMinAggregateInputType = {
    id?: true
    code?: true
    name?: true
    months?: true
    price?: true
    currency?: true
    active?: true
    updatedAt?: true
  }

  export type SubscriptionPlanMaxAggregateInputType = {
    id?: true
    code?: true
    name?: true
    months?: true
    price?: true
    currency?: true
    active?: true
    updatedAt?: true
  }

  export type SubscriptionPlanCountAggregateInputType = {
    id?: true
    code?: true
    name?: true
    months?: true
    price?: true
    currency?: true
    active?: true
    updatedAt?: true
    _all?: true
  }

  export type SubscriptionPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SubscriptionPlan to aggregate.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SubscriptionPlans
    **/
    _count?: true | SubscriptionPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SubscriptionPlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SubscriptionPlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SubscriptionPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SubscriptionPlanMaxAggregateInputType
  }

  export type GetSubscriptionPlanAggregateType<T extends SubscriptionPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateSubscriptionPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSubscriptionPlan[P]>
      : GetScalarType<T[P], AggregateSubscriptionPlan[P]>
  }




  export type SubscriptionPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SubscriptionPlanWhereInput
    orderBy?: SubscriptionPlanOrderByWithAggregationInput | SubscriptionPlanOrderByWithAggregationInput[]
    by: SubscriptionPlanScalarFieldEnum[] | SubscriptionPlanScalarFieldEnum
    having?: SubscriptionPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SubscriptionPlanCountAggregateInputType | true
    _avg?: SubscriptionPlanAvgAggregateInputType
    _sum?: SubscriptionPlanSumAggregateInputType
    _min?: SubscriptionPlanMinAggregateInputType
    _max?: SubscriptionPlanMaxAggregateInputType
  }

  export type SubscriptionPlanGroupByOutputType = {
    id: string
    code: string
    name: string
    months: number
    price: number
    currency: string
    active: boolean
    updatedAt: Date
    _count: SubscriptionPlanCountAggregateOutputType | null
    _avg: SubscriptionPlanAvgAggregateOutputType | null
    _sum: SubscriptionPlanSumAggregateOutputType | null
    _min: SubscriptionPlanMinAggregateOutputType | null
    _max: SubscriptionPlanMaxAggregateOutputType | null
  }

  type GetSubscriptionPlanGroupByPayload<T extends SubscriptionPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SubscriptionPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SubscriptionPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SubscriptionPlanGroupByOutputType[P]>
            : GetScalarType<T[P], SubscriptionPlanGroupByOutputType[P]>
        }
      >
    >


  export type SubscriptionPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    months?: boolean
    price?: boolean
    currency?: boolean
    active?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["subscriptionPlan"]>

  export type SubscriptionPlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    months?: boolean
    price?: boolean
    currency?: boolean
    active?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["subscriptionPlan"]>

  export type SubscriptionPlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    months?: boolean
    price?: boolean
    currency?: boolean
    active?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["subscriptionPlan"]>

  export type SubscriptionPlanSelectScalar = {
    id?: boolean
    code?: boolean
    name?: boolean
    months?: boolean
    price?: boolean
    currency?: boolean
    active?: boolean
    updatedAt?: boolean
  }

  export type SubscriptionPlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "name" | "months" | "price" | "currency" | "active" | "updatedAt", ExtArgs["result"]["subscriptionPlan"]>

  export type $SubscriptionPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SubscriptionPlan"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      name: string
      months: number
      price: number
      currency: string
      active: boolean
      updatedAt: Date
    }, ExtArgs["result"]["subscriptionPlan"]>
    composites: {}
  }

  type SubscriptionPlanGetPayload<S extends boolean | null | undefined | SubscriptionPlanDefaultArgs> = $Result.GetResult<Prisma.$SubscriptionPlanPayload, S>

  type SubscriptionPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SubscriptionPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SubscriptionPlanCountAggregateInputType | true
    }

  export interface SubscriptionPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SubscriptionPlan'], meta: { name: 'SubscriptionPlan' } }
    /**
     * Find zero or one SubscriptionPlan that matches the filter.
     * @param {SubscriptionPlanFindUniqueArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SubscriptionPlanFindUniqueArgs>(args: SelectSubset<T, SubscriptionPlanFindUniqueArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SubscriptionPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SubscriptionPlanFindUniqueOrThrowArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SubscriptionPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, SubscriptionPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SubscriptionPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanFindFirstArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SubscriptionPlanFindFirstArgs>(args?: SelectSubset<T, SubscriptionPlanFindFirstArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SubscriptionPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanFindFirstOrThrowArgs} args - Arguments to find a SubscriptionPlan
     * @example
     * // Get one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SubscriptionPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, SubscriptionPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SubscriptionPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SubscriptionPlans
     * const subscriptionPlans = await prisma.subscriptionPlan.findMany()
     * 
     * // Get first 10 SubscriptionPlans
     * const subscriptionPlans = await prisma.subscriptionPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const subscriptionPlanWithIdOnly = await prisma.subscriptionPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SubscriptionPlanFindManyArgs>(args?: SelectSubset<T, SubscriptionPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SubscriptionPlan.
     * @param {SubscriptionPlanCreateArgs} args - Arguments to create a SubscriptionPlan.
     * @example
     * // Create one SubscriptionPlan
     * const SubscriptionPlan = await prisma.subscriptionPlan.create({
     *   data: {
     *     // ... data to create a SubscriptionPlan
     *   }
     * })
     * 
     */
    create<T extends SubscriptionPlanCreateArgs>(args: SelectSubset<T, SubscriptionPlanCreateArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SubscriptionPlans.
     * @param {SubscriptionPlanCreateManyArgs} args - Arguments to create many SubscriptionPlans.
     * @example
     * // Create many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SubscriptionPlanCreateManyArgs>(args?: SelectSubset<T, SubscriptionPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SubscriptionPlans and returns the data saved in the database.
     * @param {SubscriptionPlanCreateManyAndReturnArgs} args - Arguments to create many SubscriptionPlans.
     * @example
     * // Create many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SubscriptionPlans and only return the `id`
     * const subscriptionPlanWithIdOnly = await prisma.subscriptionPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SubscriptionPlanCreateManyAndReturnArgs>(args?: SelectSubset<T, SubscriptionPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SubscriptionPlan.
     * @param {SubscriptionPlanDeleteArgs} args - Arguments to delete one SubscriptionPlan.
     * @example
     * // Delete one SubscriptionPlan
     * const SubscriptionPlan = await prisma.subscriptionPlan.delete({
     *   where: {
     *     // ... filter to delete one SubscriptionPlan
     *   }
     * })
     * 
     */
    delete<T extends SubscriptionPlanDeleteArgs>(args: SelectSubset<T, SubscriptionPlanDeleteArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SubscriptionPlan.
     * @param {SubscriptionPlanUpdateArgs} args - Arguments to update one SubscriptionPlan.
     * @example
     * // Update one SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SubscriptionPlanUpdateArgs>(args: SelectSubset<T, SubscriptionPlanUpdateArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SubscriptionPlans.
     * @param {SubscriptionPlanDeleteManyArgs} args - Arguments to filter SubscriptionPlans to delete.
     * @example
     * // Delete a few SubscriptionPlans
     * const { count } = await prisma.subscriptionPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SubscriptionPlanDeleteManyArgs>(args?: SelectSubset<T, SubscriptionPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SubscriptionPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SubscriptionPlanUpdateManyArgs>(args: SelectSubset<T, SubscriptionPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SubscriptionPlans and returns the data updated in the database.
     * @param {SubscriptionPlanUpdateManyAndReturnArgs} args - Arguments to update many SubscriptionPlans.
     * @example
     * // Update many SubscriptionPlans
     * const subscriptionPlan = await prisma.subscriptionPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SubscriptionPlans and only return the `id`
     * const subscriptionPlanWithIdOnly = await prisma.subscriptionPlan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SubscriptionPlanUpdateManyAndReturnArgs>(args: SelectSubset<T, SubscriptionPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SubscriptionPlan.
     * @param {SubscriptionPlanUpsertArgs} args - Arguments to update or create a SubscriptionPlan.
     * @example
     * // Update or create a SubscriptionPlan
     * const subscriptionPlan = await prisma.subscriptionPlan.upsert({
     *   create: {
     *     // ... data to create a SubscriptionPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SubscriptionPlan we want to update
     *   }
     * })
     */
    upsert<T extends SubscriptionPlanUpsertArgs>(args: SelectSubset<T, SubscriptionPlanUpsertArgs<ExtArgs>>): Prisma__SubscriptionPlanClient<$Result.GetResult<Prisma.$SubscriptionPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SubscriptionPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanCountArgs} args - Arguments to filter SubscriptionPlans to count.
     * @example
     * // Count the number of SubscriptionPlans
     * const count = await prisma.subscriptionPlan.count({
     *   where: {
     *     // ... the filter for the SubscriptionPlans we want to count
     *   }
     * })
    **/
    count<T extends SubscriptionPlanCountArgs>(
      args?: Subset<T, SubscriptionPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SubscriptionPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SubscriptionPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SubscriptionPlanAggregateArgs>(args: Subset<T, SubscriptionPlanAggregateArgs>): Prisma.PrismaPromise<GetSubscriptionPlanAggregateType<T>>

    /**
     * Group by SubscriptionPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SubscriptionPlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SubscriptionPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SubscriptionPlanGroupByArgs['orderBy'] }
        : { orderBy?: SubscriptionPlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SubscriptionPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSubscriptionPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SubscriptionPlan model
   */
  readonly fields: SubscriptionPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SubscriptionPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SubscriptionPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SubscriptionPlan model
   */
  interface SubscriptionPlanFieldRefs {
    readonly id: FieldRef<"SubscriptionPlan", 'String'>
    readonly code: FieldRef<"SubscriptionPlan", 'String'>
    readonly name: FieldRef<"SubscriptionPlan", 'String'>
    readonly months: FieldRef<"SubscriptionPlan", 'Int'>
    readonly price: FieldRef<"SubscriptionPlan", 'Float'>
    readonly currency: FieldRef<"SubscriptionPlan", 'String'>
    readonly active: FieldRef<"SubscriptionPlan", 'Boolean'>
    readonly updatedAt: FieldRef<"SubscriptionPlan", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SubscriptionPlan findUnique
   */
  export type SubscriptionPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan findUniqueOrThrow
   */
  export type SubscriptionPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan findFirst
   */
  export type SubscriptionPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SubscriptionPlans.
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SubscriptionPlans.
     */
    distinct?: SubscriptionPlanScalarFieldEnum | SubscriptionPlanScalarFieldEnum[]
  }

  /**
   * SubscriptionPlan findFirstOrThrow
   */
  export type SubscriptionPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlan to fetch.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SubscriptionPlans.
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SubscriptionPlans.
     */
    distinct?: SubscriptionPlanScalarFieldEnum | SubscriptionPlanScalarFieldEnum[]
  }

  /**
   * SubscriptionPlan findMany
   */
  export type SubscriptionPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Filter, which SubscriptionPlans to fetch.
     */
    where?: SubscriptionPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SubscriptionPlans to fetch.
     */
    orderBy?: SubscriptionPlanOrderByWithRelationInput | SubscriptionPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SubscriptionPlans.
     */
    cursor?: SubscriptionPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SubscriptionPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SubscriptionPlans.
     */
    skip?: number
    distinct?: SubscriptionPlanScalarFieldEnum | SubscriptionPlanScalarFieldEnum[]
  }

  /**
   * SubscriptionPlan create
   */
  export type SubscriptionPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * The data needed to create a SubscriptionPlan.
     */
    data: XOR<SubscriptionPlanCreateInput, SubscriptionPlanUncheckedCreateInput>
  }

  /**
   * SubscriptionPlan createMany
   */
  export type SubscriptionPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SubscriptionPlans.
     */
    data: SubscriptionPlanCreateManyInput | SubscriptionPlanCreateManyInput[]
  }

  /**
   * SubscriptionPlan createManyAndReturn
   */
  export type SubscriptionPlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * The data used to create many SubscriptionPlans.
     */
    data: SubscriptionPlanCreateManyInput | SubscriptionPlanCreateManyInput[]
  }

  /**
   * SubscriptionPlan update
   */
  export type SubscriptionPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * The data needed to update a SubscriptionPlan.
     */
    data: XOR<SubscriptionPlanUpdateInput, SubscriptionPlanUncheckedUpdateInput>
    /**
     * Choose, which SubscriptionPlan to update.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan updateMany
   */
  export type SubscriptionPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SubscriptionPlans.
     */
    data: XOR<SubscriptionPlanUpdateManyMutationInput, SubscriptionPlanUncheckedUpdateManyInput>
    /**
     * Filter which SubscriptionPlans to update
     */
    where?: SubscriptionPlanWhereInput
    /**
     * Limit how many SubscriptionPlans to update.
     */
    limit?: number
  }

  /**
   * SubscriptionPlan updateManyAndReturn
   */
  export type SubscriptionPlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * The data used to update SubscriptionPlans.
     */
    data: XOR<SubscriptionPlanUpdateManyMutationInput, SubscriptionPlanUncheckedUpdateManyInput>
    /**
     * Filter which SubscriptionPlans to update
     */
    where?: SubscriptionPlanWhereInput
    /**
     * Limit how many SubscriptionPlans to update.
     */
    limit?: number
  }

  /**
   * SubscriptionPlan upsert
   */
  export type SubscriptionPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * The filter to search for the SubscriptionPlan to update in case it exists.
     */
    where: SubscriptionPlanWhereUniqueInput
    /**
     * In case the SubscriptionPlan found by the `where` argument doesn't exist, create a new SubscriptionPlan with this data.
     */
    create: XOR<SubscriptionPlanCreateInput, SubscriptionPlanUncheckedCreateInput>
    /**
     * In case the SubscriptionPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SubscriptionPlanUpdateInput, SubscriptionPlanUncheckedUpdateInput>
  }

  /**
   * SubscriptionPlan delete
   */
  export type SubscriptionPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
    /**
     * Filter which SubscriptionPlan to delete.
     */
    where: SubscriptionPlanWhereUniqueInput
  }

  /**
   * SubscriptionPlan deleteMany
   */
  export type SubscriptionPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SubscriptionPlans to delete
     */
    where?: SubscriptionPlanWhereInput
    /**
     * Limit how many SubscriptionPlans to delete.
     */
    limit?: number
  }

  /**
   * SubscriptionPlan without action
   */
  export type SubscriptionPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SubscriptionPlan
     */
    select?: SubscriptionPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SubscriptionPlan
     */
    omit?: SubscriptionPlanOmit<ExtArgs> | null
  }


  /**
   * Model PortalSubscription
   */

  export type AggregatePortalSubscription = {
    _count: PortalSubscriptionCountAggregateOutputType | null
    _avg: PortalSubscriptionAvgAggregateOutputType | null
    _sum: PortalSubscriptionSumAggregateOutputType | null
    _min: PortalSubscriptionMinAggregateOutputType | null
    _max: PortalSubscriptionMaxAggregateOutputType | null
  }

  export type PortalSubscriptionAvgAggregateOutputType = {
    maxUsers: number | null
  }

  export type PortalSubscriptionSumAggregateOutputType = {
    maxUsers: number | null
  }

  export type PortalSubscriptionMinAggregateOutputType = {
    id: string | null
    email: string | null
    clientId: string | null
    plan: string | null
    startDate: Date | null
    expiryDate: Date | null
    status: string | null
    syncTokenHash: string | null
    maxUsers: number | null
    updatedAt: Date | null
  }

  export type PortalSubscriptionMaxAggregateOutputType = {
    id: string | null
    email: string | null
    clientId: string | null
    plan: string | null
    startDate: Date | null
    expiryDate: Date | null
    status: string | null
    syncTokenHash: string | null
    maxUsers: number | null
    updatedAt: Date | null
  }

  export type PortalSubscriptionCountAggregateOutputType = {
    id: number
    email: number
    clientId: number
    plan: number
    startDate: number
    expiryDate: number
    status: number
    syncTokenHash: number
    maxUsers: number
    updatedAt: number
    _all: number
  }


  export type PortalSubscriptionAvgAggregateInputType = {
    maxUsers?: true
  }

  export type PortalSubscriptionSumAggregateInputType = {
    maxUsers?: true
  }

  export type PortalSubscriptionMinAggregateInputType = {
    id?: true
    email?: true
    clientId?: true
    plan?: true
    startDate?: true
    expiryDate?: true
    status?: true
    syncTokenHash?: true
    maxUsers?: true
    updatedAt?: true
  }

  export type PortalSubscriptionMaxAggregateInputType = {
    id?: true
    email?: true
    clientId?: true
    plan?: true
    startDate?: true
    expiryDate?: true
    status?: true
    syncTokenHash?: true
    maxUsers?: true
    updatedAt?: true
  }

  export type PortalSubscriptionCountAggregateInputType = {
    id?: true
    email?: true
    clientId?: true
    plan?: true
    startDate?: true
    expiryDate?: true
    status?: true
    syncTokenHash?: true
    maxUsers?: true
    updatedAt?: true
    _all?: true
  }

  export type PortalSubscriptionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalSubscription to aggregate.
     */
    where?: PortalSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalSubscriptions to fetch.
     */
    orderBy?: PortalSubscriptionOrderByWithRelationInput | PortalSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PortalSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PortalSubscriptions
    **/
    _count?: true | PortalSubscriptionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PortalSubscriptionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PortalSubscriptionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PortalSubscriptionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PortalSubscriptionMaxAggregateInputType
  }

  export type GetPortalSubscriptionAggregateType<T extends PortalSubscriptionAggregateArgs> = {
        [P in keyof T & keyof AggregatePortalSubscription]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePortalSubscription[P]>
      : GetScalarType<T[P], AggregatePortalSubscription[P]>
  }




  export type PortalSubscriptionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortalSubscriptionWhereInput
    orderBy?: PortalSubscriptionOrderByWithAggregationInput | PortalSubscriptionOrderByWithAggregationInput[]
    by: PortalSubscriptionScalarFieldEnum[] | PortalSubscriptionScalarFieldEnum
    having?: PortalSubscriptionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PortalSubscriptionCountAggregateInputType | true
    _avg?: PortalSubscriptionAvgAggregateInputType
    _sum?: PortalSubscriptionSumAggregateInputType
    _min?: PortalSubscriptionMinAggregateInputType
    _max?: PortalSubscriptionMaxAggregateInputType
  }

  export type PortalSubscriptionGroupByOutputType = {
    id: string
    email: string
    clientId: string
    plan: string
    startDate: Date
    expiryDate: Date
    status: string
    syncTokenHash: string | null
    maxUsers: number
    updatedAt: Date
    _count: PortalSubscriptionCountAggregateOutputType | null
    _avg: PortalSubscriptionAvgAggregateOutputType | null
    _sum: PortalSubscriptionSumAggregateOutputType | null
    _min: PortalSubscriptionMinAggregateOutputType | null
    _max: PortalSubscriptionMaxAggregateOutputType | null
  }

  type GetPortalSubscriptionGroupByPayload<T extends PortalSubscriptionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PortalSubscriptionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PortalSubscriptionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortalSubscriptionGroupByOutputType[P]>
            : GetScalarType<T[P], PortalSubscriptionGroupByOutputType[P]>
        }
      >
    >


  export type PortalSubscriptionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    clientId?: boolean
    plan?: boolean
    startDate?: boolean
    expiryDate?: boolean
    status?: boolean
    syncTokenHash?: boolean
    maxUsers?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["portalSubscription"]>

  export type PortalSubscriptionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    clientId?: boolean
    plan?: boolean
    startDate?: boolean
    expiryDate?: boolean
    status?: boolean
    syncTokenHash?: boolean
    maxUsers?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["portalSubscription"]>

  export type PortalSubscriptionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    clientId?: boolean
    plan?: boolean
    startDate?: boolean
    expiryDate?: boolean
    status?: boolean
    syncTokenHash?: boolean
    maxUsers?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["portalSubscription"]>

  export type PortalSubscriptionSelectScalar = {
    id?: boolean
    email?: boolean
    clientId?: boolean
    plan?: boolean
    startDate?: boolean
    expiryDate?: boolean
    status?: boolean
    syncTokenHash?: boolean
    maxUsers?: boolean
    updatedAt?: boolean
  }

  export type PortalSubscriptionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "clientId" | "plan" | "startDate" | "expiryDate" | "status" | "syncTokenHash" | "maxUsers" | "updatedAt", ExtArgs["result"]["portalSubscription"]>

  export type $PortalSubscriptionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PortalSubscription"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      clientId: string
      plan: string
      startDate: Date
      expiryDate: Date
      status: string
      syncTokenHash: string | null
      maxUsers: number
      updatedAt: Date
    }, ExtArgs["result"]["portalSubscription"]>
    composites: {}
  }

  type PortalSubscriptionGetPayload<S extends boolean | null | undefined | PortalSubscriptionDefaultArgs> = $Result.GetResult<Prisma.$PortalSubscriptionPayload, S>

  type PortalSubscriptionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PortalSubscriptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PortalSubscriptionCountAggregateInputType | true
    }

  export interface PortalSubscriptionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PortalSubscription'], meta: { name: 'PortalSubscription' } }
    /**
     * Find zero or one PortalSubscription that matches the filter.
     * @param {PortalSubscriptionFindUniqueArgs} args - Arguments to find a PortalSubscription
     * @example
     * // Get one PortalSubscription
     * const portalSubscription = await prisma.portalSubscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortalSubscriptionFindUniqueArgs>(args: SelectSubset<T, PortalSubscriptionFindUniqueArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PortalSubscription that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PortalSubscriptionFindUniqueOrThrowArgs} args - Arguments to find a PortalSubscription
     * @example
     * // Get one PortalSubscription
     * const portalSubscription = await prisma.portalSubscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortalSubscriptionFindUniqueOrThrowArgs>(args: SelectSubset<T, PortalSubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalSubscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalSubscriptionFindFirstArgs} args - Arguments to find a PortalSubscription
     * @example
     * // Get one PortalSubscription
     * const portalSubscription = await prisma.portalSubscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortalSubscriptionFindFirstArgs>(args?: SelectSubset<T, PortalSubscriptionFindFirstArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalSubscription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalSubscriptionFindFirstOrThrowArgs} args - Arguments to find a PortalSubscription
     * @example
     * // Get one PortalSubscription
     * const portalSubscription = await prisma.portalSubscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortalSubscriptionFindFirstOrThrowArgs>(args?: SelectSubset<T, PortalSubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PortalSubscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalSubscriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PortalSubscriptions
     * const portalSubscriptions = await prisma.portalSubscription.findMany()
     * 
     * // Get first 10 PortalSubscriptions
     * const portalSubscriptions = await prisma.portalSubscription.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const portalSubscriptionWithIdOnly = await prisma.portalSubscription.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PortalSubscriptionFindManyArgs>(args?: SelectSubset<T, PortalSubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PortalSubscription.
     * @param {PortalSubscriptionCreateArgs} args - Arguments to create a PortalSubscription.
     * @example
     * // Create one PortalSubscription
     * const PortalSubscription = await prisma.portalSubscription.create({
     *   data: {
     *     // ... data to create a PortalSubscription
     *   }
     * })
     * 
     */
    create<T extends PortalSubscriptionCreateArgs>(args: SelectSubset<T, PortalSubscriptionCreateArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PortalSubscriptions.
     * @param {PortalSubscriptionCreateManyArgs} args - Arguments to create many PortalSubscriptions.
     * @example
     * // Create many PortalSubscriptions
     * const portalSubscription = await prisma.portalSubscription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PortalSubscriptionCreateManyArgs>(args?: SelectSubset<T, PortalSubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PortalSubscriptions and returns the data saved in the database.
     * @param {PortalSubscriptionCreateManyAndReturnArgs} args - Arguments to create many PortalSubscriptions.
     * @example
     * // Create many PortalSubscriptions
     * const portalSubscription = await prisma.portalSubscription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PortalSubscriptions and only return the `id`
     * const portalSubscriptionWithIdOnly = await prisma.portalSubscription.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PortalSubscriptionCreateManyAndReturnArgs>(args?: SelectSubset<T, PortalSubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PortalSubscription.
     * @param {PortalSubscriptionDeleteArgs} args - Arguments to delete one PortalSubscription.
     * @example
     * // Delete one PortalSubscription
     * const PortalSubscription = await prisma.portalSubscription.delete({
     *   where: {
     *     // ... filter to delete one PortalSubscription
     *   }
     * })
     * 
     */
    delete<T extends PortalSubscriptionDeleteArgs>(args: SelectSubset<T, PortalSubscriptionDeleteArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PortalSubscription.
     * @param {PortalSubscriptionUpdateArgs} args - Arguments to update one PortalSubscription.
     * @example
     * // Update one PortalSubscription
     * const portalSubscription = await prisma.portalSubscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PortalSubscriptionUpdateArgs>(args: SelectSubset<T, PortalSubscriptionUpdateArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PortalSubscriptions.
     * @param {PortalSubscriptionDeleteManyArgs} args - Arguments to filter PortalSubscriptions to delete.
     * @example
     * // Delete a few PortalSubscriptions
     * const { count } = await prisma.portalSubscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PortalSubscriptionDeleteManyArgs>(args?: SelectSubset<T, PortalSubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortalSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalSubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PortalSubscriptions
     * const portalSubscription = await prisma.portalSubscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PortalSubscriptionUpdateManyArgs>(args: SelectSubset<T, PortalSubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortalSubscriptions and returns the data updated in the database.
     * @param {PortalSubscriptionUpdateManyAndReturnArgs} args - Arguments to update many PortalSubscriptions.
     * @example
     * // Update many PortalSubscriptions
     * const portalSubscription = await prisma.portalSubscription.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PortalSubscriptions and only return the `id`
     * const portalSubscriptionWithIdOnly = await prisma.portalSubscription.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PortalSubscriptionUpdateManyAndReturnArgs>(args: SelectSubset<T, PortalSubscriptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PortalSubscription.
     * @param {PortalSubscriptionUpsertArgs} args - Arguments to update or create a PortalSubscription.
     * @example
     * // Update or create a PortalSubscription
     * const portalSubscription = await prisma.portalSubscription.upsert({
     *   create: {
     *     // ... data to create a PortalSubscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PortalSubscription we want to update
     *   }
     * })
     */
    upsert<T extends PortalSubscriptionUpsertArgs>(args: SelectSubset<T, PortalSubscriptionUpsertArgs<ExtArgs>>): Prisma__PortalSubscriptionClient<$Result.GetResult<Prisma.$PortalSubscriptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PortalSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalSubscriptionCountArgs} args - Arguments to filter PortalSubscriptions to count.
     * @example
     * // Count the number of PortalSubscriptions
     * const count = await prisma.portalSubscription.count({
     *   where: {
     *     // ... the filter for the PortalSubscriptions we want to count
     *   }
     * })
    **/
    count<T extends PortalSubscriptionCountArgs>(
      args?: Subset<T, PortalSubscriptionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortalSubscriptionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PortalSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalSubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PortalSubscriptionAggregateArgs>(args: Subset<T, PortalSubscriptionAggregateArgs>): Prisma.PrismaPromise<GetPortalSubscriptionAggregateType<T>>

    /**
     * Group by PortalSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalSubscriptionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PortalSubscriptionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortalSubscriptionGroupByArgs['orderBy'] }
        : { orderBy?: PortalSubscriptionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PortalSubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPortalSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PortalSubscription model
   */
  readonly fields: PortalSubscriptionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PortalSubscription.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortalSubscriptionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PortalSubscription model
   */
  interface PortalSubscriptionFieldRefs {
    readonly id: FieldRef<"PortalSubscription", 'String'>
    readonly email: FieldRef<"PortalSubscription", 'String'>
    readonly clientId: FieldRef<"PortalSubscription", 'String'>
    readonly plan: FieldRef<"PortalSubscription", 'String'>
    readonly startDate: FieldRef<"PortalSubscription", 'DateTime'>
    readonly expiryDate: FieldRef<"PortalSubscription", 'DateTime'>
    readonly status: FieldRef<"PortalSubscription", 'String'>
    readonly syncTokenHash: FieldRef<"PortalSubscription", 'String'>
    readonly maxUsers: FieldRef<"PortalSubscription", 'Int'>
    readonly updatedAt: FieldRef<"PortalSubscription", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PortalSubscription findUnique
   */
  export type PortalSubscriptionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which PortalSubscription to fetch.
     */
    where: PortalSubscriptionWhereUniqueInput
  }

  /**
   * PortalSubscription findUniqueOrThrow
   */
  export type PortalSubscriptionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which PortalSubscription to fetch.
     */
    where: PortalSubscriptionWhereUniqueInput
  }

  /**
   * PortalSubscription findFirst
   */
  export type PortalSubscriptionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which PortalSubscription to fetch.
     */
    where?: PortalSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalSubscriptions to fetch.
     */
    orderBy?: PortalSubscriptionOrderByWithRelationInput | PortalSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalSubscriptions.
     */
    cursor?: PortalSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalSubscriptions.
     */
    distinct?: PortalSubscriptionScalarFieldEnum | PortalSubscriptionScalarFieldEnum[]
  }

  /**
   * PortalSubscription findFirstOrThrow
   */
  export type PortalSubscriptionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which PortalSubscription to fetch.
     */
    where?: PortalSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalSubscriptions to fetch.
     */
    orderBy?: PortalSubscriptionOrderByWithRelationInput | PortalSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalSubscriptions.
     */
    cursor?: PortalSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalSubscriptions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalSubscriptions.
     */
    distinct?: PortalSubscriptionScalarFieldEnum | PortalSubscriptionScalarFieldEnum[]
  }

  /**
   * PortalSubscription findMany
   */
  export type PortalSubscriptionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * Filter, which PortalSubscriptions to fetch.
     */
    where?: PortalSubscriptionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalSubscriptions to fetch.
     */
    orderBy?: PortalSubscriptionOrderByWithRelationInput | PortalSubscriptionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PortalSubscriptions.
     */
    cursor?: PortalSubscriptionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalSubscriptions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalSubscriptions.
     */
    skip?: number
    distinct?: PortalSubscriptionScalarFieldEnum | PortalSubscriptionScalarFieldEnum[]
  }

  /**
   * PortalSubscription create
   */
  export type PortalSubscriptionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * The data needed to create a PortalSubscription.
     */
    data: XOR<PortalSubscriptionCreateInput, PortalSubscriptionUncheckedCreateInput>
  }

  /**
   * PortalSubscription createMany
   */
  export type PortalSubscriptionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PortalSubscriptions.
     */
    data: PortalSubscriptionCreateManyInput | PortalSubscriptionCreateManyInput[]
  }

  /**
   * PortalSubscription createManyAndReturn
   */
  export type PortalSubscriptionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * The data used to create many PortalSubscriptions.
     */
    data: PortalSubscriptionCreateManyInput | PortalSubscriptionCreateManyInput[]
  }

  /**
   * PortalSubscription update
   */
  export type PortalSubscriptionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * The data needed to update a PortalSubscription.
     */
    data: XOR<PortalSubscriptionUpdateInput, PortalSubscriptionUncheckedUpdateInput>
    /**
     * Choose, which PortalSubscription to update.
     */
    where: PortalSubscriptionWhereUniqueInput
  }

  /**
   * PortalSubscription updateMany
   */
  export type PortalSubscriptionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PortalSubscriptions.
     */
    data: XOR<PortalSubscriptionUpdateManyMutationInput, PortalSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which PortalSubscriptions to update
     */
    where?: PortalSubscriptionWhereInput
    /**
     * Limit how many PortalSubscriptions to update.
     */
    limit?: number
  }

  /**
   * PortalSubscription updateManyAndReturn
   */
  export type PortalSubscriptionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * The data used to update PortalSubscriptions.
     */
    data: XOR<PortalSubscriptionUpdateManyMutationInput, PortalSubscriptionUncheckedUpdateManyInput>
    /**
     * Filter which PortalSubscriptions to update
     */
    where?: PortalSubscriptionWhereInput
    /**
     * Limit how many PortalSubscriptions to update.
     */
    limit?: number
  }

  /**
   * PortalSubscription upsert
   */
  export type PortalSubscriptionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * The filter to search for the PortalSubscription to update in case it exists.
     */
    where: PortalSubscriptionWhereUniqueInput
    /**
     * In case the PortalSubscription found by the `where` argument doesn't exist, create a new PortalSubscription with this data.
     */
    create: XOR<PortalSubscriptionCreateInput, PortalSubscriptionUncheckedCreateInput>
    /**
     * In case the PortalSubscription was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortalSubscriptionUpdateInput, PortalSubscriptionUncheckedUpdateInput>
  }

  /**
   * PortalSubscription delete
   */
  export type PortalSubscriptionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
    /**
     * Filter which PortalSubscription to delete.
     */
    where: PortalSubscriptionWhereUniqueInput
  }

  /**
   * PortalSubscription deleteMany
   */
  export type PortalSubscriptionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalSubscriptions to delete
     */
    where?: PortalSubscriptionWhereInput
    /**
     * Limit how many PortalSubscriptions to delete.
     */
    limit?: number
  }

  /**
   * PortalSubscription without action
   */
  export type PortalSubscriptionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalSubscription
     */
    select?: PortalSubscriptionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalSubscription
     */
    omit?: PortalSubscriptionOmit<ExtArgs> | null
  }


  /**
   * Model PortalPayment
   */

  export type AggregatePortalPayment = {
    _count: PortalPaymentCountAggregateOutputType | null
    _avg: PortalPaymentAvgAggregateOutputType | null
    _sum: PortalPaymentSumAggregateOutputType | null
    _min: PortalPaymentMinAggregateOutputType | null
    _max: PortalPaymentMaxAggregateOutputType | null
  }

  export type PortalPaymentAvgAggregateOutputType = {
    amount: number | null
    maxUsers: number | null
  }

  export type PortalPaymentSumAggregateOutputType = {
    amount: number | null
    maxUsers: number | null
  }

  export type PortalPaymentMinAggregateOutputType = {
    id: string | null
    email: string | null
    planCode: string | null
    amount: number | null
    currency: string | null
    maxUsers: number | null
    orderId: string | null
    paymentId: string | null
    status: string | null
    createdAt: Date | null
  }

  export type PortalPaymentMaxAggregateOutputType = {
    id: string | null
    email: string | null
    planCode: string | null
    amount: number | null
    currency: string | null
    maxUsers: number | null
    orderId: string | null
    paymentId: string | null
    status: string | null
    createdAt: Date | null
  }

  export type PortalPaymentCountAggregateOutputType = {
    id: number
    email: number
    planCode: number
    amount: number
    currency: number
    maxUsers: number
    orderId: number
    paymentId: number
    status: number
    createdAt: number
    _all: number
  }


  export type PortalPaymentAvgAggregateInputType = {
    amount?: true
    maxUsers?: true
  }

  export type PortalPaymentSumAggregateInputType = {
    amount?: true
    maxUsers?: true
  }

  export type PortalPaymentMinAggregateInputType = {
    id?: true
    email?: true
    planCode?: true
    amount?: true
    currency?: true
    maxUsers?: true
    orderId?: true
    paymentId?: true
    status?: true
    createdAt?: true
  }

  export type PortalPaymentMaxAggregateInputType = {
    id?: true
    email?: true
    planCode?: true
    amount?: true
    currency?: true
    maxUsers?: true
    orderId?: true
    paymentId?: true
    status?: true
    createdAt?: true
  }

  export type PortalPaymentCountAggregateInputType = {
    id?: true
    email?: true
    planCode?: true
    amount?: true
    currency?: true
    maxUsers?: true
    orderId?: true
    paymentId?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type PortalPaymentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalPayment to aggregate.
     */
    where?: PortalPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalPayments to fetch.
     */
    orderBy?: PortalPaymentOrderByWithRelationInput | PortalPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PortalPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PortalPayments
    **/
    _count?: true | PortalPaymentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PortalPaymentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PortalPaymentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PortalPaymentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PortalPaymentMaxAggregateInputType
  }

  export type GetPortalPaymentAggregateType<T extends PortalPaymentAggregateArgs> = {
        [P in keyof T & keyof AggregatePortalPayment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePortalPayment[P]>
      : GetScalarType<T[P], AggregatePortalPayment[P]>
  }




  export type PortalPaymentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PortalPaymentWhereInput
    orderBy?: PortalPaymentOrderByWithAggregationInput | PortalPaymentOrderByWithAggregationInput[]
    by: PortalPaymentScalarFieldEnum[] | PortalPaymentScalarFieldEnum
    having?: PortalPaymentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PortalPaymentCountAggregateInputType | true
    _avg?: PortalPaymentAvgAggregateInputType
    _sum?: PortalPaymentSumAggregateInputType
    _min?: PortalPaymentMinAggregateInputType
    _max?: PortalPaymentMaxAggregateInputType
  }

  export type PortalPaymentGroupByOutputType = {
    id: string
    email: string
    planCode: string
    amount: number
    currency: string
    maxUsers: number
    orderId: string
    paymentId: string | null
    status: string
    createdAt: Date
    _count: PortalPaymentCountAggregateOutputType | null
    _avg: PortalPaymentAvgAggregateOutputType | null
    _sum: PortalPaymentSumAggregateOutputType | null
    _min: PortalPaymentMinAggregateOutputType | null
    _max: PortalPaymentMaxAggregateOutputType | null
  }

  type GetPortalPaymentGroupByPayload<T extends PortalPaymentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PortalPaymentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PortalPaymentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PortalPaymentGroupByOutputType[P]>
            : GetScalarType<T[P], PortalPaymentGroupByOutputType[P]>
        }
      >
    >


  export type PortalPaymentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    planCode?: boolean
    amount?: boolean
    currency?: boolean
    maxUsers?: boolean
    orderId?: boolean
    paymentId?: boolean
    status?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["portalPayment"]>

  export type PortalPaymentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    planCode?: boolean
    amount?: boolean
    currency?: boolean
    maxUsers?: boolean
    orderId?: boolean
    paymentId?: boolean
    status?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["portalPayment"]>

  export type PortalPaymentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    planCode?: boolean
    amount?: boolean
    currency?: boolean
    maxUsers?: boolean
    orderId?: boolean
    paymentId?: boolean
    status?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["portalPayment"]>

  export type PortalPaymentSelectScalar = {
    id?: boolean
    email?: boolean
    planCode?: boolean
    amount?: boolean
    currency?: boolean
    maxUsers?: boolean
    orderId?: boolean
    paymentId?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type PortalPaymentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "planCode" | "amount" | "currency" | "maxUsers" | "orderId" | "paymentId" | "status" | "createdAt", ExtArgs["result"]["portalPayment"]>

  export type $PortalPaymentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PortalPayment"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      planCode: string
      amount: number
      currency: string
      maxUsers: number
      orderId: string
      paymentId: string | null
      status: string
      createdAt: Date
    }, ExtArgs["result"]["portalPayment"]>
    composites: {}
  }

  type PortalPaymentGetPayload<S extends boolean | null | undefined | PortalPaymentDefaultArgs> = $Result.GetResult<Prisma.$PortalPaymentPayload, S>

  type PortalPaymentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PortalPaymentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PortalPaymentCountAggregateInputType | true
    }

  export interface PortalPaymentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PortalPayment'], meta: { name: 'PortalPayment' } }
    /**
     * Find zero or one PortalPayment that matches the filter.
     * @param {PortalPaymentFindUniqueArgs} args - Arguments to find a PortalPayment
     * @example
     * // Get one PortalPayment
     * const portalPayment = await prisma.portalPayment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PortalPaymentFindUniqueArgs>(args: SelectSubset<T, PortalPaymentFindUniqueArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PortalPayment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PortalPaymentFindUniqueOrThrowArgs} args - Arguments to find a PortalPayment
     * @example
     * // Get one PortalPayment
     * const portalPayment = await prisma.portalPayment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PortalPaymentFindUniqueOrThrowArgs>(args: SelectSubset<T, PortalPaymentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalPayment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalPaymentFindFirstArgs} args - Arguments to find a PortalPayment
     * @example
     * // Get one PortalPayment
     * const portalPayment = await prisma.portalPayment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PortalPaymentFindFirstArgs>(args?: SelectSubset<T, PortalPaymentFindFirstArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PortalPayment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalPaymentFindFirstOrThrowArgs} args - Arguments to find a PortalPayment
     * @example
     * // Get one PortalPayment
     * const portalPayment = await prisma.portalPayment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PortalPaymentFindFirstOrThrowArgs>(args?: SelectSubset<T, PortalPaymentFindFirstOrThrowArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PortalPayments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalPaymentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PortalPayments
     * const portalPayments = await prisma.portalPayment.findMany()
     * 
     * // Get first 10 PortalPayments
     * const portalPayments = await prisma.portalPayment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const portalPaymentWithIdOnly = await prisma.portalPayment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PortalPaymentFindManyArgs>(args?: SelectSubset<T, PortalPaymentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PortalPayment.
     * @param {PortalPaymentCreateArgs} args - Arguments to create a PortalPayment.
     * @example
     * // Create one PortalPayment
     * const PortalPayment = await prisma.portalPayment.create({
     *   data: {
     *     // ... data to create a PortalPayment
     *   }
     * })
     * 
     */
    create<T extends PortalPaymentCreateArgs>(args: SelectSubset<T, PortalPaymentCreateArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PortalPayments.
     * @param {PortalPaymentCreateManyArgs} args - Arguments to create many PortalPayments.
     * @example
     * // Create many PortalPayments
     * const portalPayment = await prisma.portalPayment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PortalPaymentCreateManyArgs>(args?: SelectSubset<T, PortalPaymentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PortalPayments and returns the data saved in the database.
     * @param {PortalPaymentCreateManyAndReturnArgs} args - Arguments to create many PortalPayments.
     * @example
     * // Create many PortalPayments
     * const portalPayment = await prisma.portalPayment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PortalPayments and only return the `id`
     * const portalPaymentWithIdOnly = await prisma.portalPayment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PortalPaymentCreateManyAndReturnArgs>(args?: SelectSubset<T, PortalPaymentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PortalPayment.
     * @param {PortalPaymentDeleteArgs} args - Arguments to delete one PortalPayment.
     * @example
     * // Delete one PortalPayment
     * const PortalPayment = await prisma.portalPayment.delete({
     *   where: {
     *     // ... filter to delete one PortalPayment
     *   }
     * })
     * 
     */
    delete<T extends PortalPaymentDeleteArgs>(args: SelectSubset<T, PortalPaymentDeleteArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PortalPayment.
     * @param {PortalPaymentUpdateArgs} args - Arguments to update one PortalPayment.
     * @example
     * // Update one PortalPayment
     * const portalPayment = await prisma.portalPayment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PortalPaymentUpdateArgs>(args: SelectSubset<T, PortalPaymentUpdateArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PortalPayments.
     * @param {PortalPaymentDeleteManyArgs} args - Arguments to filter PortalPayments to delete.
     * @example
     * // Delete a few PortalPayments
     * const { count } = await prisma.portalPayment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PortalPaymentDeleteManyArgs>(args?: SelectSubset<T, PortalPaymentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortalPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalPaymentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PortalPayments
     * const portalPayment = await prisma.portalPayment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PortalPaymentUpdateManyArgs>(args: SelectSubset<T, PortalPaymentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PortalPayments and returns the data updated in the database.
     * @param {PortalPaymentUpdateManyAndReturnArgs} args - Arguments to update many PortalPayments.
     * @example
     * // Update many PortalPayments
     * const portalPayment = await prisma.portalPayment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PortalPayments and only return the `id`
     * const portalPaymentWithIdOnly = await prisma.portalPayment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PortalPaymentUpdateManyAndReturnArgs>(args: SelectSubset<T, PortalPaymentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PortalPayment.
     * @param {PortalPaymentUpsertArgs} args - Arguments to update or create a PortalPayment.
     * @example
     * // Update or create a PortalPayment
     * const portalPayment = await prisma.portalPayment.upsert({
     *   create: {
     *     // ... data to create a PortalPayment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PortalPayment we want to update
     *   }
     * })
     */
    upsert<T extends PortalPaymentUpsertArgs>(args: SelectSubset<T, PortalPaymentUpsertArgs<ExtArgs>>): Prisma__PortalPaymentClient<$Result.GetResult<Prisma.$PortalPaymentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PortalPayments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalPaymentCountArgs} args - Arguments to filter PortalPayments to count.
     * @example
     * // Count the number of PortalPayments
     * const count = await prisma.portalPayment.count({
     *   where: {
     *     // ... the filter for the PortalPayments we want to count
     *   }
     * })
    **/
    count<T extends PortalPaymentCountArgs>(
      args?: Subset<T, PortalPaymentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PortalPaymentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PortalPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalPaymentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PortalPaymentAggregateArgs>(args: Subset<T, PortalPaymentAggregateArgs>): Prisma.PrismaPromise<GetPortalPaymentAggregateType<T>>

    /**
     * Group by PortalPayment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PortalPaymentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PortalPaymentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PortalPaymentGroupByArgs['orderBy'] }
        : { orderBy?: PortalPaymentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PortalPaymentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPortalPaymentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PortalPayment model
   */
  readonly fields: PortalPaymentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PortalPayment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PortalPaymentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PortalPayment model
   */
  interface PortalPaymentFieldRefs {
    readonly id: FieldRef<"PortalPayment", 'String'>
    readonly email: FieldRef<"PortalPayment", 'String'>
    readonly planCode: FieldRef<"PortalPayment", 'String'>
    readonly amount: FieldRef<"PortalPayment", 'Float'>
    readonly currency: FieldRef<"PortalPayment", 'String'>
    readonly maxUsers: FieldRef<"PortalPayment", 'Int'>
    readonly orderId: FieldRef<"PortalPayment", 'String'>
    readonly paymentId: FieldRef<"PortalPayment", 'String'>
    readonly status: FieldRef<"PortalPayment", 'String'>
    readonly createdAt: FieldRef<"PortalPayment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PortalPayment findUnique
   */
  export type PortalPaymentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * Filter, which PortalPayment to fetch.
     */
    where: PortalPaymentWhereUniqueInput
  }

  /**
   * PortalPayment findUniqueOrThrow
   */
  export type PortalPaymentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * Filter, which PortalPayment to fetch.
     */
    where: PortalPaymentWhereUniqueInput
  }

  /**
   * PortalPayment findFirst
   */
  export type PortalPaymentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * Filter, which PortalPayment to fetch.
     */
    where?: PortalPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalPayments to fetch.
     */
    orderBy?: PortalPaymentOrderByWithRelationInput | PortalPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalPayments.
     */
    cursor?: PortalPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalPayments.
     */
    distinct?: PortalPaymentScalarFieldEnum | PortalPaymentScalarFieldEnum[]
  }

  /**
   * PortalPayment findFirstOrThrow
   */
  export type PortalPaymentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * Filter, which PortalPayment to fetch.
     */
    where?: PortalPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalPayments to fetch.
     */
    orderBy?: PortalPaymentOrderByWithRelationInput | PortalPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PortalPayments.
     */
    cursor?: PortalPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalPayments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PortalPayments.
     */
    distinct?: PortalPaymentScalarFieldEnum | PortalPaymentScalarFieldEnum[]
  }

  /**
   * PortalPayment findMany
   */
  export type PortalPaymentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * Filter, which PortalPayments to fetch.
     */
    where?: PortalPaymentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PortalPayments to fetch.
     */
    orderBy?: PortalPaymentOrderByWithRelationInput | PortalPaymentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PortalPayments.
     */
    cursor?: PortalPaymentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PortalPayments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PortalPayments.
     */
    skip?: number
    distinct?: PortalPaymentScalarFieldEnum | PortalPaymentScalarFieldEnum[]
  }

  /**
   * PortalPayment create
   */
  export type PortalPaymentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * The data needed to create a PortalPayment.
     */
    data: XOR<PortalPaymentCreateInput, PortalPaymentUncheckedCreateInput>
  }

  /**
   * PortalPayment createMany
   */
  export type PortalPaymentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PortalPayments.
     */
    data: PortalPaymentCreateManyInput | PortalPaymentCreateManyInput[]
  }

  /**
   * PortalPayment createManyAndReturn
   */
  export type PortalPaymentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * The data used to create many PortalPayments.
     */
    data: PortalPaymentCreateManyInput | PortalPaymentCreateManyInput[]
  }

  /**
   * PortalPayment update
   */
  export type PortalPaymentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * The data needed to update a PortalPayment.
     */
    data: XOR<PortalPaymentUpdateInput, PortalPaymentUncheckedUpdateInput>
    /**
     * Choose, which PortalPayment to update.
     */
    where: PortalPaymentWhereUniqueInput
  }

  /**
   * PortalPayment updateMany
   */
  export type PortalPaymentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PortalPayments.
     */
    data: XOR<PortalPaymentUpdateManyMutationInput, PortalPaymentUncheckedUpdateManyInput>
    /**
     * Filter which PortalPayments to update
     */
    where?: PortalPaymentWhereInput
    /**
     * Limit how many PortalPayments to update.
     */
    limit?: number
  }

  /**
   * PortalPayment updateManyAndReturn
   */
  export type PortalPaymentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * The data used to update PortalPayments.
     */
    data: XOR<PortalPaymentUpdateManyMutationInput, PortalPaymentUncheckedUpdateManyInput>
    /**
     * Filter which PortalPayments to update
     */
    where?: PortalPaymentWhereInput
    /**
     * Limit how many PortalPayments to update.
     */
    limit?: number
  }

  /**
   * PortalPayment upsert
   */
  export type PortalPaymentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * The filter to search for the PortalPayment to update in case it exists.
     */
    where: PortalPaymentWhereUniqueInput
    /**
     * In case the PortalPayment found by the `where` argument doesn't exist, create a new PortalPayment with this data.
     */
    create: XOR<PortalPaymentCreateInput, PortalPaymentUncheckedCreateInput>
    /**
     * In case the PortalPayment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PortalPaymentUpdateInput, PortalPaymentUncheckedUpdateInput>
  }

  /**
   * PortalPayment delete
   */
  export type PortalPaymentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
    /**
     * Filter which PortalPayment to delete.
     */
    where: PortalPaymentWhereUniqueInput
  }

  /**
   * PortalPayment deleteMany
   */
  export type PortalPaymentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PortalPayments to delete
     */
    where?: PortalPaymentWhereInput
    /**
     * Limit how many PortalPayments to delete.
     */
    limit?: number
  }

  /**
   * PortalPayment without action
   */
  export type PortalPaymentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PortalPayment
     */
    select?: PortalPaymentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PortalPayment
     */
    omit?: PortalPaymentOmit<ExtArgs> | null
  }


  /**
   * Model SaasAdmin
   */

  export type AggregateSaasAdmin = {
    _count: SaasAdminCountAggregateOutputType | null
    _min: SaasAdminMinAggregateOutputType | null
    _max: SaasAdminMaxAggregateOutputType | null
  }

  export type SaasAdminMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
  }

  export type SaasAdminMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    createdAt: Date | null
  }

  export type SaasAdminCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    createdAt: number
    _all: number
  }


  export type SaasAdminMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
  }

  export type SaasAdminMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
  }

  export type SaasAdminCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    createdAt?: true
    _all?: true
  }

  export type SaasAdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaasAdmin to aggregate.
     */
    where?: SaasAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaasAdmins to fetch.
     */
    orderBy?: SaasAdminOrderByWithRelationInput | SaasAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SaasAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaasAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaasAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SaasAdmins
    **/
    _count?: true | SaasAdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SaasAdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SaasAdminMaxAggregateInputType
  }

  export type GetSaasAdminAggregateType<T extends SaasAdminAggregateArgs> = {
        [P in keyof T & keyof AggregateSaasAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSaasAdmin[P]>
      : GetScalarType<T[P], AggregateSaasAdmin[P]>
  }




  export type SaasAdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SaasAdminWhereInput
    orderBy?: SaasAdminOrderByWithAggregationInput | SaasAdminOrderByWithAggregationInput[]
    by: SaasAdminScalarFieldEnum[] | SaasAdminScalarFieldEnum
    having?: SaasAdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SaasAdminCountAggregateInputType | true
    _min?: SaasAdminMinAggregateInputType
    _max?: SaasAdminMaxAggregateInputType
  }

  export type SaasAdminGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    createdAt: Date
    _count: SaasAdminCountAggregateOutputType | null
    _min: SaasAdminMinAggregateOutputType | null
    _max: SaasAdminMaxAggregateOutputType | null
  }

  type GetSaasAdminGroupByPayload<T extends SaasAdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SaasAdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SaasAdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SaasAdminGroupByOutputType[P]>
            : GetScalarType<T[P], SaasAdminGroupByOutputType[P]>
        }
      >
    >


  export type SaasAdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["saasAdmin"]>

  export type SaasAdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["saasAdmin"]>

  export type SaasAdminSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["saasAdmin"]>

  export type SaasAdminSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    createdAt?: boolean
  }

  export type SaasAdminOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "createdAt", ExtArgs["result"]["saasAdmin"]>

  export type $SaasAdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SaasAdmin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      createdAt: Date
    }, ExtArgs["result"]["saasAdmin"]>
    composites: {}
  }

  type SaasAdminGetPayload<S extends boolean | null | undefined | SaasAdminDefaultArgs> = $Result.GetResult<Prisma.$SaasAdminPayload, S>

  type SaasAdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SaasAdminFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SaasAdminCountAggregateInputType | true
    }

  export interface SaasAdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SaasAdmin'], meta: { name: 'SaasAdmin' } }
    /**
     * Find zero or one SaasAdmin that matches the filter.
     * @param {SaasAdminFindUniqueArgs} args - Arguments to find a SaasAdmin
     * @example
     * // Get one SaasAdmin
     * const saasAdmin = await prisma.saasAdmin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SaasAdminFindUniqueArgs>(args: SelectSubset<T, SaasAdminFindUniqueArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SaasAdmin that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SaasAdminFindUniqueOrThrowArgs} args - Arguments to find a SaasAdmin
     * @example
     * // Get one SaasAdmin
     * const saasAdmin = await prisma.saasAdmin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SaasAdminFindUniqueOrThrowArgs>(args: SelectSubset<T, SaasAdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SaasAdmin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaasAdminFindFirstArgs} args - Arguments to find a SaasAdmin
     * @example
     * // Get one SaasAdmin
     * const saasAdmin = await prisma.saasAdmin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SaasAdminFindFirstArgs>(args?: SelectSubset<T, SaasAdminFindFirstArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SaasAdmin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaasAdminFindFirstOrThrowArgs} args - Arguments to find a SaasAdmin
     * @example
     * // Get one SaasAdmin
     * const saasAdmin = await prisma.saasAdmin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SaasAdminFindFirstOrThrowArgs>(args?: SelectSubset<T, SaasAdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SaasAdmins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaasAdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SaasAdmins
     * const saasAdmins = await prisma.saasAdmin.findMany()
     * 
     * // Get first 10 SaasAdmins
     * const saasAdmins = await prisma.saasAdmin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const saasAdminWithIdOnly = await prisma.saasAdmin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SaasAdminFindManyArgs>(args?: SelectSubset<T, SaasAdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SaasAdmin.
     * @param {SaasAdminCreateArgs} args - Arguments to create a SaasAdmin.
     * @example
     * // Create one SaasAdmin
     * const SaasAdmin = await prisma.saasAdmin.create({
     *   data: {
     *     // ... data to create a SaasAdmin
     *   }
     * })
     * 
     */
    create<T extends SaasAdminCreateArgs>(args: SelectSubset<T, SaasAdminCreateArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SaasAdmins.
     * @param {SaasAdminCreateManyArgs} args - Arguments to create many SaasAdmins.
     * @example
     * // Create many SaasAdmins
     * const saasAdmin = await prisma.saasAdmin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SaasAdminCreateManyArgs>(args?: SelectSubset<T, SaasAdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SaasAdmins and returns the data saved in the database.
     * @param {SaasAdminCreateManyAndReturnArgs} args - Arguments to create many SaasAdmins.
     * @example
     * // Create many SaasAdmins
     * const saasAdmin = await prisma.saasAdmin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SaasAdmins and only return the `id`
     * const saasAdminWithIdOnly = await prisma.saasAdmin.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SaasAdminCreateManyAndReturnArgs>(args?: SelectSubset<T, SaasAdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SaasAdmin.
     * @param {SaasAdminDeleteArgs} args - Arguments to delete one SaasAdmin.
     * @example
     * // Delete one SaasAdmin
     * const SaasAdmin = await prisma.saasAdmin.delete({
     *   where: {
     *     // ... filter to delete one SaasAdmin
     *   }
     * })
     * 
     */
    delete<T extends SaasAdminDeleteArgs>(args: SelectSubset<T, SaasAdminDeleteArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SaasAdmin.
     * @param {SaasAdminUpdateArgs} args - Arguments to update one SaasAdmin.
     * @example
     * // Update one SaasAdmin
     * const saasAdmin = await prisma.saasAdmin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SaasAdminUpdateArgs>(args: SelectSubset<T, SaasAdminUpdateArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SaasAdmins.
     * @param {SaasAdminDeleteManyArgs} args - Arguments to filter SaasAdmins to delete.
     * @example
     * // Delete a few SaasAdmins
     * const { count } = await prisma.saasAdmin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SaasAdminDeleteManyArgs>(args?: SelectSubset<T, SaasAdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SaasAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaasAdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SaasAdmins
     * const saasAdmin = await prisma.saasAdmin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SaasAdminUpdateManyArgs>(args: SelectSubset<T, SaasAdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SaasAdmins and returns the data updated in the database.
     * @param {SaasAdminUpdateManyAndReturnArgs} args - Arguments to update many SaasAdmins.
     * @example
     * // Update many SaasAdmins
     * const saasAdmin = await prisma.saasAdmin.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SaasAdmins and only return the `id`
     * const saasAdminWithIdOnly = await prisma.saasAdmin.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SaasAdminUpdateManyAndReturnArgs>(args: SelectSubset<T, SaasAdminUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SaasAdmin.
     * @param {SaasAdminUpsertArgs} args - Arguments to update or create a SaasAdmin.
     * @example
     * // Update or create a SaasAdmin
     * const saasAdmin = await prisma.saasAdmin.upsert({
     *   create: {
     *     // ... data to create a SaasAdmin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SaasAdmin we want to update
     *   }
     * })
     */
    upsert<T extends SaasAdminUpsertArgs>(args: SelectSubset<T, SaasAdminUpsertArgs<ExtArgs>>): Prisma__SaasAdminClient<$Result.GetResult<Prisma.$SaasAdminPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SaasAdmins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaasAdminCountArgs} args - Arguments to filter SaasAdmins to count.
     * @example
     * // Count the number of SaasAdmins
     * const count = await prisma.saasAdmin.count({
     *   where: {
     *     // ... the filter for the SaasAdmins we want to count
     *   }
     * })
    **/
    count<T extends SaasAdminCountArgs>(
      args?: Subset<T, SaasAdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SaasAdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SaasAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaasAdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SaasAdminAggregateArgs>(args: Subset<T, SaasAdminAggregateArgs>): Prisma.PrismaPromise<GetSaasAdminAggregateType<T>>

    /**
     * Group by SaasAdmin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaasAdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SaasAdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SaasAdminGroupByArgs['orderBy'] }
        : { orderBy?: SaasAdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SaasAdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSaasAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SaasAdmin model
   */
  readonly fields: SaasAdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SaasAdmin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SaasAdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SaasAdmin model
   */
  interface SaasAdminFieldRefs {
    readonly id: FieldRef<"SaasAdmin", 'String'>
    readonly name: FieldRef<"SaasAdmin", 'String'>
    readonly email: FieldRef<"SaasAdmin", 'String'>
    readonly password: FieldRef<"SaasAdmin", 'String'>
    readonly createdAt: FieldRef<"SaasAdmin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SaasAdmin findUnique
   */
  export type SaasAdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * Filter, which SaasAdmin to fetch.
     */
    where: SaasAdminWhereUniqueInput
  }

  /**
   * SaasAdmin findUniqueOrThrow
   */
  export type SaasAdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * Filter, which SaasAdmin to fetch.
     */
    where: SaasAdminWhereUniqueInput
  }

  /**
   * SaasAdmin findFirst
   */
  export type SaasAdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * Filter, which SaasAdmin to fetch.
     */
    where?: SaasAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaasAdmins to fetch.
     */
    orderBy?: SaasAdminOrderByWithRelationInput | SaasAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaasAdmins.
     */
    cursor?: SaasAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaasAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaasAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaasAdmins.
     */
    distinct?: SaasAdminScalarFieldEnum | SaasAdminScalarFieldEnum[]
  }

  /**
   * SaasAdmin findFirstOrThrow
   */
  export type SaasAdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * Filter, which SaasAdmin to fetch.
     */
    where?: SaasAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaasAdmins to fetch.
     */
    orderBy?: SaasAdminOrderByWithRelationInput | SaasAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaasAdmins.
     */
    cursor?: SaasAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaasAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaasAdmins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaasAdmins.
     */
    distinct?: SaasAdminScalarFieldEnum | SaasAdminScalarFieldEnum[]
  }

  /**
   * SaasAdmin findMany
   */
  export type SaasAdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * Filter, which SaasAdmins to fetch.
     */
    where?: SaasAdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaasAdmins to fetch.
     */
    orderBy?: SaasAdminOrderByWithRelationInput | SaasAdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SaasAdmins.
     */
    cursor?: SaasAdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaasAdmins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaasAdmins.
     */
    skip?: number
    distinct?: SaasAdminScalarFieldEnum | SaasAdminScalarFieldEnum[]
  }

  /**
   * SaasAdmin create
   */
  export type SaasAdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * The data needed to create a SaasAdmin.
     */
    data: XOR<SaasAdminCreateInput, SaasAdminUncheckedCreateInput>
  }

  /**
   * SaasAdmin createMany
   */
  export type SaasAdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SaasAdmins.
     */
    data: SaasAdminCreateManyInput | SaasAdminCreateManyInput[]
  }

  /**
   * SaasAdmin createManyAndReturn
   */
  export type SaasAdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * The data used to create many SaasAdmins.
     */
    data: SaasAdminCreateManyInput | SaasAdminCreateManyInput[]
  }

  /**
   * SaasAdmin update
   */
  export type SaasAdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * The data needed to update a SaasAdmin.
     */
    data: XOR<SaasAdminUpdateInput, SaasAdminUncheckedUpdateInput>
    /**
     * Choose, which SaasAdmin to update.
     */
    where: SaasAdminWhereUniqueInput
  }

  /**
   * SaasAdmin updateMany
   */
  export type SaasAdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SaasAdmins.
     */
    data: XOR<SaasAdminUpdateManyMutationInput, SaasAdminUncheckedUpdateManyInput>
    /**
     * Filter which SaasAdmins to update
     */
    where?: SaasAdminWhereInput
    /**
     * Limit how many SaasAdmins to update.
     */
    limit?: number
  }

  /**
   * SaasAdmin updateManyAndReturn
   */
  export type SaasAdminUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * The data used to update SaasAdmins.
     */
    data: XOR<SaasAdminUpdateManyMutationInput, SaasAdminUncheckedUpdateManyInput>
    /**
     * Filter which SaasAdmins to update
     */
    where?: SaasAdminWhereInput
    /**
     * Limit how many SaasAdmins to update.
     */
    limit?: number
  }

  /**
   * SaasAdmin upsert
   */
  export type SaasAdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * The filter to search for the SaasAdmin to update in case it exists.
     */
    where: SaasAdminWhereUniqueInput
    /**
     * In case the SaasAdmin found by the `where` argument doesn't exist, create a new SaasAdmin with this data.
     */
    create: XOR<SaasAdminCreateInput, SaasAdminUncheckedCreateInput>
    /**
     * In case the SaasAdmin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SaasAdminUpdateInput, SaasAdminUncheckedUpdateInput>
  }

  /**
   * SaasAdmin delete
   */
  export type SaasAdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
    /**
     * Filter which SaasAdmin to delete.
     */
    where: SaasAdminWhereUniqueInput
  }

  /**
   * SaasAdmin deleteMany
   */
  export type SaasAdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaasAdmins to delete
     */
    where?: SaasAdminWhereInput
    /**
     * Limit how many SaasAdmins to delete.
     */
    limit?: number
  }

  /**
   * SaasAdmin without action
   */
  export type SaasAdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaasAdmin
     */
    select?: SaasAdminSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SaasAdmin
     */
    omit?: SaasAdminOmit<ExtArgs> | null
  }


  /**
   * Model AppSetting
   */

  export type AggregateAppSetting = {
    _count: AppSettingCountAggregateOutputType | null
    _min: AppSettingMinAggregateOutputType | null
    _max: AppSettingMaxAggregateOutputType | null
  }

  export type AppSettingMinAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type AppSettingMaxAggregateOutputType = {
    key: string | null
    value: string | null
    updatedAt: Date | null
  }

  export type AppSettingCountAggregateOutputType = {
    key: number
    value: number
    updatedAt: number
    _all: number
  }


  export type AppSettingMinAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type AppSettingMaxAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
  }

  export type AppSettingCountAggregateInputType = {
    key?: true
    value?: true
    updatedAt?: true
    _all?: true
  }

  export type AppSettingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppSetting to aggregate.
     */
    where?: AppSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingOrderByWithRelationInput | AppSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AppSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppSettings
    **/
    _count?: true | AppSettingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppSettingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppSettingMaxAggregateInputType
  }

  export type GetAppSettingAggregateType<T extends AppSettingAggregateArgs> = {
        [P in keyof T & keyof AggregateAppSetting]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppSetting[P]>
      : GetScalarType<T[P], AggregateAppSetting[P]>
  }




  export type AppSettingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AppSettingWhereInput
    orderBy?: AppSettingOrderByWithAggregationInput | AppSettingOrderByWithAggregationInput[]
    by: AppSettingScalarFieldEnum[] | AppSettingScalarFieldEnum
    having?: AppSettingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppSettingCountAggregateInputType | true
    _min?: AppSettingMinAggregateInputType
    _max?: AppSettingMaxAggregateInputType
  }

  export type AppSettingGroupByOutputType = {
    key: string
    value: string
    updatedAt: Date
    _count: AppSettingCountAggregateOutputType | null
    _min: AppSettingMinAggregateOutputType | null
    _max: AppSettingMaxAggregateOutputType | null
  }

  type GetAppSettingGroupByPayload<T extends AppSettingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AppSettingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppSettingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppSettingGroupByOutputType[P]>
            : GetScalarType<T[P], AppSettingGroupByOutputType[P]>
        }
      >
    >


  export type AppSettingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSetting"]>

  export type AppSettingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSetting"]>

  export type AppSettingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["appSetting"]>

  export type AppSettingSelectScalar = {
    key?: boolean
    value?: boolean
    updatedAt?: boolean
  }

  export type AppSettingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"key" | "value" | "updatedAt", ExtArgs["result"]["appSetting"]>

  export type $AppSettingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AppSetting"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      key: string
      value: string
      updatedAt: Date
    }, ExtArgs["result"]["appSetting"]>
    composites: {}
  }

  type AppSettingGetPayload<S extends boolean | null | undefined | AppSettingDefaultArgs> = $Result.GetResult<Prisma.$AppSettingPayload, S>

  type AppSettingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AppSettingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AppSettingCountAggregateInputType | true
    }

  export interface AppSettingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AppSetting'], meta: { name: 'AppSetting' } }
    /**
     * Find zero or one AppSetting that matches the filter.
     * @param {AppSettingFindUniqueArgs} args - Arguments to find a AppSetting
     * @example
     * // Get one AppSetting
     * const appSetting = await prisma.appSetting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AppSettingFindUniqueArgs>(args: SelectSubset<T, AppSettingFindUniqueArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AppSetting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AppSettingFindUniqueOrThrowArgs} args - Arguments to find a AppSetting
     * @example
     * // Get one AppSetting
     * const appSetting = await prisma.appSetting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AppSettingFindUniqueOrThrowArgs>(args: SelectSubset<T, AppSettingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppSetting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingFindFirstArgs} args - Arguments to find a AppSetting
     * @example
     * // Get one AppSetting
     * const appSetting = await prisma.appSetting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AppSettingFindFirstArgs>(args?: SelectSubset<T, AppSettingFindFirstArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AppSetting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingFindFirstOrThrowArgs} args - Arguments to find a AppSetting
     * @example
     * // Get one AppSetting
     * const appSetting = await prisma.appSetting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AppSettingFindFirstOrThrowArgs>(args?: SelectSubset<T, AppSettingFindFirstOrThrowArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AppSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppSettings
     * const appSettings = await prisma.appSetting.findMany()
     * 
     * // Get first 10 AppSettings
     * const appSettings = await prisma.appSetting.findMany({ take: 10 })
     * 
     * // Only select the `key`
     * const appSettingWithKeyOnly = await prisma.appSetting.findMany({ select: { key: true } })
     * 
     */
    findMany<T extends AppSettingFindManyArgs>(args?: SelectSubset<T, AppSettingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AppSetting.
     * @param {AppSettingCreateArgs} args - Arguments to create a AppSetting.
     * @example
     * // Create one AppSetting
     * const AppSetting = await prisma.appSetting.create({
     *   data: {
     *     // ... data to create a AppSetting
     *   }
     * })
     * 
     */
    create<T extends AppSettingCreateArgs>(args: SelectSubset<T, AppSettingCreateArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AppSettings.
     * @param {AppSettingCreateManyArgs} args - Arguments to create many AppSettings.
     * @example
     * // Create many AppSettings
     * const appSetting = await prisma.appSetting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AppSettingCreateManyArgs>(args?: SelectSubset<T, AppSettingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AppSettings and returns the data saved in the database.
     * @param {AppSettingCreateManyAndReturnArgs} args - Arguments to create many AppSettings.
     * @example
     * // Create many AppSettings
     * const appSetting = await prisma.appSetting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AppSettings and only return the `key`
     * const appSettingWithKeyOnly = await prisma.appSetting.createManyAndReturn({
     *   select: { key: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AppSettingCreateManyAndReturnArgs>(args?: SelectSubset<T, AppSettingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AppSetting.
     * @param {AppSettingDeleteArgs} args - Arguments to delete one AppSetting.
     * @example
     * // Delete one AppSetting
     * const AppSetting = await prisma.appSetting.delete({
     *   where: {
     *     // ... filter to delete one AppSetting
     *   }
     * })
     * 
     */
    delete<T extends AppSettingDeleteArgs>(args: SelectSubset<T, AppSettingDeleteArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AppSetting.
     * @param {AppSettingUpdateArgs} args - Arguments to update one AppSetting.
     * @example
     * // Update one AppSetting
     * const appSetting = await prisma.appSetting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AppSettingUpdateArgs>(args: SelectSubset<T, AppSettingUpdateArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AppSettings.
     * @param {AppSettingDeleteManyArgs} args - Arguments to filter AppSettings to delete.
     * @example
     * // Delete a few AppSettings
     * const { count } = await prisma.appSetting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AppSettingDeleteManyArgs>(args?: SelectSubset<T, AppSettingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppSettings
     * const appSetting = await prisma.appSetting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AppSettingUpdateManyArgs>(args: SelectSubset<T, AppSettingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppSettings and returns the data updated in the database.
     * @param {AppSettingUpdateManyAndReturnArgs} args - Arguments to update many AppSettings.
     * @example
     * // Update many AppSettings
     * const appSetting = await prisma.appSetting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AppSettings and only return the `key`
     * const appSettingWithKeyOnly = await prisma.appSetting.updateManyAndReturn({
     *   select: { key: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AppSettingUpdateManyAndReturnArgs>(args: SelectSubset<T, AppSettingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AppSetting.
     * @param {AppSettingUpsertArgs} args - Arguments to update or create a AppSetting.
     * @example
     * // Update or create a AppSetting
     * const appSetting = await prisma.appSetting.upsert({
     *   create: {
     *     // ... data to create a AppSetting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppSetting we want to update
     *   }
     * })
     */
    upsert<T extends AppSettingUpsertArgs>(args: SelectSubset<T, AppSettingUpsertArgs<ExtArgs>>): Prisma__AppSettingClient<$Result.GetResult<Prisma.$AppSettingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AppSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingCountArgs} args - Arguments to filter AppSettings to count.
     * @example
     * // Count the number of AppSettings
     * const count = await prisma.appSetting.count({
     *   where: {
     *     // ... the filter for the AppSettings we want to count
     *   }
     * })
    **/
    count<T extends AppSettingCountArgs>(
      args?: Subset<T, AppSettingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppSettingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppSettingAggregateArgs>(args: Subset<T, AppSettingAggregateArgs>): Prisma.PrismaPromise<GetAppSettingAggregateType<T>>

    /**
     * Group by AppSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppSettingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppSettingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppSettingGroupByArgs['orderBy'] }
        : { orderBy?: AppSettingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppSettingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppSettingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AppSetting model
   */
  readonly fields: AppSettingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AppSetting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AppSettingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AppSetting model
   */
  interface AppSettingFieldRefs {
    readonly key: FieldRef<"AppSetting", 'String'>
    readonly value: FieldRef<"AppSetting", 'String'>
    readonly updatedAt: FieldRef<"AppSetting", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AppSetting findUnique
   */
  export type AppSettingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * Filter, which AppSetting to fetch.
     */
    where: AppSettingWhereUniqueInput
  }

  /**
   * AppSetting findUniqueOrThrow
   */
  export type AppSettingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * Filter, which AppSetting to fetch.
     */
    where: AppSettingWhereUniqueInput
  }

  /**
   * AppSetting findFirst
   */
  export type AppSettingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * Filter, which AppSetting to fetch.
     */
    where?: AppSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingOrderByWithRelationInput | AppSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppSettings.
     */
    cursor?: AppSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppSettings.
     */
    distinct?: AppSettingScalarFieldEnum | AppSettingScalarFieldEnum[]
  }

  /**
   * AppSetting findFirstOrThrow
   */
  export type AppSettingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * Filter, which AppSetting to fetch.
     */
    where?: AppSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingOrderByWithRelationInput | AppSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppSettings.
     */
    cursor?: AppSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppSettings.
     */
    distinct?: AppSettingScalarFieldEnum | AppSettingScalarFieldEnum[]
  }

  /**
   * AppSetting findMany
   */
  export type AppSettingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * Filter, which AppSettings to fetch.
     */
    where?: AppSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppSettings to fetch.
     */
    orderBy?: AppSettingOrderByWithRelationInput | AppSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppSettings.
     */
    cursor?: AppSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppSettings.
     */
    skip?: number
    distinct?: AppSettingScalarFieldEnum | AppSettingScalarFieldEnum[]
  }

  /**
   * AppSetting create
   */
  export type AppSettingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * The data needed to create a AppSetting.
     */
    data: XOR<AppSettingCreateInput, AppSettingUncheckedCreateInput>
  }

  /**
   * AppSetting createMany
   */
  export type AppSettingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AppSettings.
     */
    data: AppSettingCreateManyInput | AppSettingCreateManyInput[]
  }

  /**
   * AppSetting createManyAndReturn
   */
  export type AppSettingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * The data used to create many AppSettings.
     */
    data: AppSettingCreateManyInput | AppSettingCreateManyInput[]
  }

  /**
   * AppSetting update
   */
  export type AppSettingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * The data needed to update a AppSetting.
     */
    data: XOR<AppSettingUpdateInput, AppSettingUncheckedUpdateInput>
    /**
     * Choose, which AppSetting to update.
     */
    where: AppSettingWhereUniqueInput
  }

  /**
   * AppSetting updateMany
   */
  export type AppSettingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AppSettings.
     */
    data: XOR<AppSettingUpdateManyMutationInput, AppSettingUncheckedUpdateManyInput>
    /**
     * Filter which AppSettings to update
     */
    where?: AppSettingWhereInput
    /**
     * Limit how many AppSettings to update.
     */
    limit?: number
  }

  /**
   * AppSetting updateManyAndReturn
   */
  export type AppSettingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * The data used to update AppSettings.
     */
    data: XOR<AppSettingUpdateManyMutationInput, AppSettingUncheckedUpdateManyInput>
    /**
     * Filter which AppSettings to update
     */
    where?: AppSettingWhereInput
    /**
     * Limit how many AppSettings to update.
     */
    limit?: number
  }

  /**
   * AppSetting upsert
   */
  export type AppSettingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * The filter to search for the AppSetting to update in case it exists.
     */
    where: AppSettingWhereUniqueInput
    /**
     * In case the AppSetting found by the `where` argument doesn't exist, create a new AppSetting with this data.
     */
    create: XOR<AppSettingCreateInput, AppSettingUncheckedCreateInput>
    /**
     * In case the AppSetting was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AppSettingUpdateInput, AppSettingUncheckedUpdateInput>
  }

  /**
   * AppSetting delete
   */
  export type AppSettingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
    /**
     * Filter which AppSetting to delete.
     */
    where: AppSettingWhereUniqueInput
  }

  /**
   * AppSetting deleteMany
   */
  export type AppSettingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AppSettings to delete
     */
    where?: AppSettingWhereInput
    /**
     * Limit how many AppSettings to delete.
     */
    limit?: number
  }

  /**
   * AppSetting without action
   */
  export type AppSettingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AppSetting
     */
    select?: AppSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AppSetting
     */
    omit?: AppSettingOmit<ExtArgs> | null
  }


  /**
   * Model ActivationKey
   */

  export type AggregateActivationKey = {
    _count: ActivationKeyCountAggregateOutputType | null
    _avg: ActivationKeyAvgAggregateOutputType | null
    _sum: ActivationKeySumAggregateOutputType | null
    _min: ActivationKeyMinAggregateOutputType | null
    _max: ActivationKeyMaxAggregateOutputType | null
  }

  export type ActivationKeyAvgAggregateOutputType = {
    maxActivations: number | null
    transferLimit: number | null
    transfersUsed: number | null
  }

  export type ActivationKeySumAggregateOutputType = {
    maxActivations: number | null
    transferLimit: number | null
    transfersUsed: number | null
  }

  export type ActivationKeyMinAggregateOutputType = {
    id: string | null
    key: string | null
    tenantId: string | null
    instituteName: string | null
    companyName: string | null
    maxActivations: number | null
    transferLimit: number | null
    transfersUsed: number | null
    status: string | null
    firstActivatedAt: Date | null
    createdAt: Date | null
    companyId: string | null
    kind: string | null
  }

  export type ActivationKeyMaxAggregateOutputType = {
    id: string | null
    key: string | null
    tenantId: string | null
    instituteName: string | null
    companyName: string | null
    maxActivations: number | null
    transferLimit: number | null
    transfersUsed: number | null
    status: string | null
    firstActivatedAt: Date | null
    createdAt: Date | null
    companyId: string | null
    kind: string | null
  }

  export type ActivationKeyCountAggregateOutputType = {
    id: number
    key: number
    tenantId: number
    instituteName: number
    companyName: number
    maxActivations: number
    transferLimit: number
    transfersUsed: number
    status: number
    firstActivatedAt: number
    createdAt: number
    companyId: number
    kind: number
    _all: number
  }


  export type ActivationKeyAvgAggregateInputType = {
    maxActivations?: true
    transferLimit?: true
    transfersUsed?: true
  }

  export type ActivationKeySumAggregateInputType = {
    maxActivations?: true
    transferLimit?: true
    transfersUsed?: true
  }

  export type ActivationKeyMinAggregateInputType = {
    id?: true
    key?: true
    tenantId?: true
    instituteName?: true
    companyName?: true
    maxActivations?: true
    transferLimit?: true
    transfersUsed?: true
    status?: true
    firstActivatedAt?: true
    createdAt?: true
    companyId?: true
    kind?: true
  }

  export type ActivationKeyMaxAggregateInputType = {
    id?: true
    key?: true
    tenantId?: true
    instituteName?: true
    companyName?: true
    maxActivations?: true
    transferLimit?: true
    transfersUsed?: true
    status?: true
    firstActivatedAt?: true
    createdAt?: true
    companyId?: true
    kind?: true
  }

  export type ActivationKeyCountAggregateInputType = {
    id?: true
    key?: true
    tenantId?: true
    instituteName?: true
    companyName?: true
    maxActivations?: true
    transferLimit?: true
    transfersUsed?: true
    status?: true
    firstActivatedAt?: true
    createdAt?: true
    companyId?: true
    kind?: true
    _all?: true
  }

  export type ActivationKeyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivationKey to aggregate.
     */
    where?: ActivationKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationKeys to fetch.
     */
    orderBy?: ActivationKeyOrderByWithRelationInput | ActivationKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivationKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ActivationKeys
    **/
    _count?: true | ActivationKeyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ActivationKeyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ActivationKeySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivationKeyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivationKeyMaxAggregateInputType
  }

  export type GetActivationKeyAggregateType<T extends ActivationKeyAggregateArgs> = {
        [P in keyof T & keyof AggregateActivationKey]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivationKey[P]>
      : GetScalarType<T[P], AggregateActivationKey[P]>
  }




  export type ActivationKeyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivationKeyWhereInput
    orderBy?: ActivationKeyOrderByWithAggregationInput | ActivationKeyOrderByWithAggregationInput[]
    by: ActivationKeyScalarFieldEnum[] | ActivationKeyScalarFieldEnum
    having?: ActivationKeyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivationKeyCountAggregateInputType | true
    _avg?: ActivationKeyAvgAggregateInputType
    _sum?: ActivationKeySumAggregateInputType
    _min?: ActivationKeyMinAggregateInputType
    _max?: ActivationKeyMaxAggregateInputType
  }

  export type ActivationKeyGroupByOutputType = {
    id: string
    key: string
    tenantId: string
    instituteName: string
    companyName: string
    maxActivations: number
    transferLimit: number
    transfersUsed: number
    status: string
    firstActivatedAt: Date | null
    createdAt: Date
    companyId: string | null
    kind: string
    _count: ActivationKeyCountAggregateOutputType | null
    _avg: ActivationKeyAvgAggregateOutputType | null
    _sum: ActivationKeySumAggregateOutputType | null
    _min: ActivationKeyMinAggregateOutputType | null
    _max: ActivationKeyMaxAggregateOutputType | null
  }

  type GetActivationKeyGroupByPayload<T extends ActivationKeyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivationKeyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivationKeyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivationKeyGroupByOutputType[P]>
            : GetScalarType<T[P], ActivationKeyGroupByOutputType[P]>
        }
      >
    >


  export type ActivationKeySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    tenantId?: boolean
    instituteName?: boolean
    companyName?: boolean
    maxActivations?: boolean
    transferLimit?: boolean
    transfersUsed?: boolean
    status?: boolean
    firstActivatedAt?: boolean
    createdAt?: boolean
    companyId?: boolean
    kind?: boolean
    devices?: boolean | ActivationKey$devicesArgs<ExtArgs>
    _count?: boolean | ActivationKeyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activationKey"]>

  export type ActivationKeySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    tenantId?: boolean
    instituteName?: boolean
    companyName?: boolean
    maxActivations?: boolean
    transferLimit?: boolean
    transfersUsed?: boolean
    status?: boolean
    firstActivatedAt?: boolean
    createdAt?: boolean
    companyId?: boolean
    kind?: boolean
  }, ExtArgs["result"]["activationKey"]>

  export type ActivationKeySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    tenantId?: boolean
    instituteName?: boolean
    companyName?: boolean
    maxActivations?: boolean
    transferLimit?: boolean
    transfersUsed?: boolean
    status?: boolean
    firstActivatedAt?: boolean
    createdAt?: boolean
    companyId?: boolean
    kind?: boolean
  }, ExtArgs["result"]["activationKey"]>

  export type ActivationKeySelectScalar = {
    id?: boolean
    key?: boolean
    tenantId?: boolean
    instituteName?: boolean
    companyName?: boolean
    maxActivations?: boolean
    transferLimit?: boolean
    transfersUsed?: boolean
    status?: boolean
    firstActivatedAt?: boolean
    createdAt?: boolean
    companyId?: boolean
    kind?: boolean
  }

  export type ActivationKeyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "tenantId" | "instituteName" | "companyName" | "maxActivations" | "transferLimit" | "transfersUsed" | "status" | "firstActivatedAt" | "createdAt" | "companyId" | "kind", ExtArgs["result"]["activationKey"]>
  export type ActivationKeyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    devices?: boolean | ActivationKey$devicesArgs<ExtArgs>
    _count?: boolean | ActivationKeyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ActivationKeyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ActivationKeyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ActivationKeyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ActivationKey"
    objects: {
      devices: Prisma.$ActivationDevicePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      tenantId: string
      instituteName: string
      companyName: string
      maxActivations: number
      transferLimit: number
      transfersUsed: number
      status: string
      firstActivatedAt: Date | null
      createdAt: Date
      companyId: string | null
      kind: string
    }, ExtArgs["result"]["activationKey"]>
    composites: {}
  }

  type ActivationKeyGetPayload<S extends boolean | null | undefined | ActivationKeyDefaultArgs> = $Result.GetResult<Prisma.$ActivationKeyPayload, S>

  type ActivationKeyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivationKeyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivationKeyCountAggregateInputType | true
    }

  export interface ActivationKeyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ActivationKey'], meta: { name: 'ActivationKey' } }
    /**
     * Find zero or one ActivationKey that matches the filter.
     * @param {ActivationKeyFindUniqueArgs} args - Arguments to find a ActivationKey
     * @example
     * // Get one ActivationKey
     * const activationKey = await prisma.activationKey.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivationKeyFindUniqueArgs>(args: SelectSubset<T, ActivationKeyFindUniqueArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ActivationKey that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivationKeyFindUniqueOrThrowArgs} args - Arguments to find a ActivationKey
     * @example
     * // Get one ActivationKey
     * const activationKey = await prisma.activationKey.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivationKeyFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivationKeyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivationKey that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationKeyFindFirstArgs} args - Arguments to find a ActivationKey
     * @example
     * // Get one ActivationKey
     * const activationKey = await prisma.activationKey.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivationKeyFindFirstArgs>(args?: SelectSubset<T, ActivationKeyFindFirstArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivationKey that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationKeyFindFirstOrThrowArgs} args - Arguments to find a ActivationKey
     * @example
     * // Get one ActivationKey
     * const activationKey = await prisma.activationKey.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivationKeyFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivationKeyFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivationKeys that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationKeyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActivationKeys
     * const activationKeys = await prisma.activationKey.findMany()
     * 
     * // Get first 10 ActivationKeys
     * const activationKeys = await prisma.activationKey.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activationKeyWithIdOnly = await prisma.activationKey.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivationKeyFindManyArgs>(args?: SelectSubset<T, ActivationKeyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ActivationKey.
     * @param {ActivationKeyCreateArgs} args - Arguments to create a ActivationKey.
     * @example
     * // Create one ActivationKey
     * const ActivationKey = await prisma.activationKey.create({
     *   data: {
     *     // ... data to create a ActivationKey
     *   }
     * })
     * 
     */
    create<T extends ActivationKeyCreateArgs>(args: SelectSubset<T, ActivationKeyCreateArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ActivationKeys.
     * @param {ActivationKeyCreateManyArgs} args - Arguments to create many ActivationKeys.
     * @example
     * // Create many ActivationKeys
     * const activationKey = await prisma.activationKey.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivationKeyCreateManyArgs>(args?: SelectSubset<T, ActivationKeyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ActivationKeys and returns the data saved in the database.
     * @param {ActivationKeyCreateManyAndReturnArgs} args - Arguments to create many ActivationKeys.
     * @example
     * // Create many ActivationKeys
     * const activationKey = await prisma.activationKey.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ActivationKeys and only return the `id`
     * const activationKeyWithIdOnly = await prisma.activationKey.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ActivationKeyCreateManyAndReturnArgs>(args?: SelectSubset<T, ActivationKeyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ActivationKey.
     * @param {ActivationKeyDeleteArgs} args - Arguments to delete one ActivationKey.
     * @example
     * // Delete one ActivationKey
     * const ActivationKey = await prisma.activationKey.delete({
     *   where: {
     *     // ... filter to delete one ActivationKey
     *   }
     * })
     * 
     */
    delete<T extends ActivationKeyDeleteArgs>(args: SelectSubset<T, ActivationKeyDeleteArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ActivationKey.
     * @param {ActivationKeyUpdateArgs} args - Arguments to update one ActivationKey.
     * @example
     * // Update one ActivationKey
     * const activationKey = await prisma.activationKey.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivationKeyUpdateArgs>(args: SelectSubset<T, ActivationKeyUpdateArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ActivationKeys.
     * @param {ActivationKeyDeleteManyArgs} args - Arguments to filter ActivationKeys to delete.
     * @example
     * // Delete a few ActivationKeys
     * const { count } = await prisma.activationKey.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivationKeyDeleteManyArgs>(args?: SelectSubset<T, ActivationKeyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivationKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationKeyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActivationKeys
     * const activationKey = await prisma.activationKey.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivationKeyUpdateManyArgs>(args: SelectSubset<T, ActivationKeyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivationKeys and returns the data updated in the database.
     * @param {ActivationKeyUpdateManyAndReturnArgs} args - Arguments to update many ActivationKeys.
     * @example
     * // Update many ActivationKeys
     * const activationKey = await prisma.activationKey.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ActivationKeys and only return the `id`
     * const activationKeyWithIdOnly = await prisma.activationKey.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ActivationKeyUpdateManyAndReturnArgs>(args: SelectSubset<T, ActivationKeyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ActivationKey.
     * @param {ActivationKeyUpsertArgs} args - Arguments to update or create a ActivationKey.
     * @example
     * // Update or create a ActivationKey
     * const activationKey = await prisma.activationKey.upsert({
     *   create: {
     *     // ... data to create a ActivationKey
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActivationKey we want to update
     *   }
     * })
     */
    upsert<T extends ActivationKeyUpsertArgs>(args: SelectSubset<T, ActivationKeyUpsertArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ActivationKeys.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationKeyCountArgs} args - Arguments to filter ActivationKeys to count.
     * @example
     * // Count the number of ActivationKeys
     * const count = await prisma.activationKey.count({
     *   where: {
     *     // ... the filter for the ActivationKeys we want to count
     *   }
     * })
    **/
    count<T extends ActivationKeyCountArgs>(
      args?: Subset<T, ActivationKeyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivationKeyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ActivationKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationKeyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ActivationKeyAggregateArgs>(args: Subset<T, ActivationKeyAggregateArgs>): Prisma.PrismaPromise<GetActivationKeyAggregateType<T>>

    /**
     * Group by ActivationKey.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationKeyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ActivationKeyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivationKeyGroupByArgs['orderBy'] }
        : { orderBy?: ActivationKeyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ActivationKeyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivationKeyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ActivationKey model
   */
  readonly fields: ActivationKeyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ActivationKey.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivationKeyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    devices<T extends ActivationKey$devicesArgs<ExtArgs> = {}>(args?: Subset<T, ActivationKey$devicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ActivationKey model
   */
  interface ActivationKeyFieldRefs {
    readonly id: FieldRef<"ActivationKey", 'String'>
    readonly key: FieldRef<"ActivationKey", 'String'>
    readonly tenantId: FieldRef<"ActivationKey", 'String'>
    readonly instituteName: FieldRef<"ActivationKey", 'String'>
    readonly companyName: FieldRef<"ActivationKey", 'String'>
    readonly maxActivations: FieldRef<"ActivationKey", 'Int'>
    readonly transferLimit: FieldRef<"ActivationKey", 'Int'>
    readonly transfersUsed: FieldRef<"ActivationKey", 'Int'>
    readonly status: FieldRef<"ActivationKey", 'String'>
    readonly firstActivatedAt: FieldRef<"ActivationKey", 'DateTime'>
    readonly createdAt: FieldRef<"ActivationKey", 'DateTime'>
    readonly companyId: FieldRef<"ActivationKey", 'String'>
    readonly kind: FieldRef<"ActivationKey", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ActivationKey findUnique
   */
  export type ActivationKeyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * Filter, which ActivationKey to fetch.
     */
    where: ActivationKeyWhereUniqueInput
  }

  /**
   * ActivationKey findUniqueOrThrow
   */
  export type ActivationKeyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * Filter, which ActivationKey to fetch.
     */
    where: ActivationKeyWhereUniqueInput
  }

  /**
   * ActivationKey findFirst
   */
  export type ActivationKeyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * Filter, which ActivationKey to fetch.
     */
    where?: ActivationKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationKeys to fetch.
     */
    orderBy?: ActivationKeyOrderByWithRelationInput | ActivationKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivationKeys.
     */
    cursor?: ActivationKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivationKeys.
     */
    distinct?: ActivationKeyScalarFieldEnum | ActivationKeyScalarFieldEnum[]
  }

  /**
   * ActivationKey findFirstOrThrow
   */
  export type ActivationKeyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * Filter, which ActivationKey to fetch.
     */
    where?: ActivationKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationKeys to fetch.
     */
    orderBy?: ActivationKeyOrderByWithRelationInput | ActivationKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivationKeys.
     */
    cursor?: ActivationKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationKeys.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivationKeys.
     */
    distinct?: ActivationKeyScalarFieldEnum | ActivationKeyScalarFieldEnum[]
  }

  /**
   * ActivationKey findMany
   */
  export type ActivationKeyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * Filter, which ActivationKeys to fetch.
     */
    where?: ActivationKeyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationKeys to fetch.
     */
    orderBy?: ActivationKeyOrderByWithRelationInput | ActivationKeyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ActivationKeys.
     */
    cursor?: ActivationKeyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationKeys from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationKeys.
     */
    skip?: number
    distinct?: ActivationKeyScalarFieldEnum | ActivationKeyScalarFieldEnum[]
  }

  /**
   * ActivationKey create
   */
  export type ActivationKeyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * The data needed to create a ActivationKey.
     */
    data: XOR<ActivationKeyCreateInput, ActivationKeyUncheckedCreateInput>
  }

  /**
   * ActivationKey createMany
   */
  export type ActivationKeyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActivationKeys.
     */
    data: ActivationKeyCreateManyInput | ActivationKeyCreateManyInput[]
  }

  /**
   * ActivationKey createManyAndReturn
   */
  export type ActivationKeyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * The data used to create many ActivationKeys.
     */
    data: ActivationKeyCreateManyInput | ActivationKeyCreateManyInput[]
  }

  /**
   * ActivationKey update
   */
  export type ActivationKeyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * The data needed to update a ActivationKey.
     */
    data: XOR<ActivationKeyUpdateInput, ActivationKeyUncheckedUpdateInput>
    /**
     * Choose, which ActivationKey to update.
     */
    where: ActivationKeyWhereUniqueInput
  }

  /**
   * ActivationKey updateMany
   */
  export type ActivationKeyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ActivationKeys.
     */
    data: XOR<ActivationKeyUpdateManyMutationInput, ActivationKeyUncheckedUpdateManyInput>
    /**
     * Filter which ActivationKeys to update
     */
    where?: ActivationKeyWhereInput
    /**
     * Limit how many ActivationKeys to update.
     */
    limit?: number
  }

  /**
   * ActivationKey updateManyAndReturn
   */
  export type ActivationKeyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * The data used to update ActivationKeys.
     */
    data: XOR<ActivationKeyUpdateManyMutationInput, ActivationKeyUncheckedUpdateManyInput>
    /**
     * Filter which ActivationKeys to update
     */
    where?: ActivationKeyWhereInput
    /**
     * Limit how many ActivationKeys to update.
     */
    limit?: number
  }

  /**
   * ActivationKey upsert
   */
  export type ActivationKeyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * The filter to search for the ActivationKey to update in case it exists.
     */
    where: ActivationKeyWhereUniqueInput
    /**
     * In case the ActivationKey found by the `where` argument doesn't exist, create a new ActivationKey with this data.
     */
    create: XOR<ActivationKeyCreateInput, ActivationKeyUncheckedCreateInput>
    /**
     * In case the ActivationKey was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivationKeyUpdateInput, ActivationKeyUncheckedUpdateInput>
  }

  /**
   * ActivationKey delete
   */
  export type ActivationKeyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
    /**
     * Filter which ActivationKey to delete.
     */
    where: ActivationKeyWhereUniqueInput
  }

  /**
   * ActivationKey deleteMany
   */
  export type ActivationKeyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivationKeys to delete
     */
    where?: ActivationKeyWhereInput
    /**
     * Limit how many ActivationKeys to delete.
     */
    limit?: number
  }

  /**
   * ActivationKey.devices
   */
  export type ActivationKey$devicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    where?: ActivationDeviceWhereInput
    orderBy?: ActivationDeviceOrderByWithRelationInput | ActivationDeviceOrderByWithRelationInput[]
    cursor?: ActivationDeviceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ActivationDeviceScalarFieldEnum | ActivationDeviceScalarFieldEnum[]
  }

  /**
   * ActivationKey without action
   */
  export type ActivationKeyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationKey
     */
    select?: ActivationKeySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationKey
     */
    omit?: ActivationKeyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationKeyInclude<ExtArgs> | null
  }


  /**
   * Model ActivationDevice
   */

  export type AggregateActivationDevice = {
    _count: ActivationDeviceCountAggregateOutputType | null
    _min: ActivationDeviceMinAggregateOutputType | null
    _max: ActivationDeviceMaxAggregateOutputType | null
  }

  export type ActivationDeviceMinAggregateOutputType = {
    id: string | null
    activationKeyId: string | null
    deviceId: string | null
    deviceName: string | null
    os: string | null
    status: string | null
    activatedAt: Date | null
    lastVerifiedAt: Date | null
    deactivatedAt: Date | null
  }

  export type ActivationDeviceMaxAggregateOutputType = {
    id: string | null
    activationKeyId: string | null
    deviceId: string | null
    deviceName: string | null
    os: string | null
    status: string | null
    activatedAt: Date | null
    lastVerifiedAt: Date | null
    deactivatedAt: Date | null
  }

  export type ActivationDeviceCountAggregateOutputType = {
    id: number
    activationKeyId: number
    deviceId: number
    deviceName: number
    os: number
    status: number
    activatedAt: number
    lastVerifiedAt: number
    deactivatedAt: number
    _all: number
  }


  export type ActivationDeviceMinAggregateInputType = {
    id?: true
    activationKeyId?: true
    deviceId?: true
    deviceName?: true
    os?: true
    status?: true
    activatedAt?: true
    lastVerifiedAt?: true
    deactivatedAt?: true
  }

  export type ActivationDeviceMaxAggregateInputType = {
    id?: true
    activationKeyId?: true
    deviceId?: true
    deviceName?: true
    os?: true
    status?: true
    activatedAt?: true
    lastVerifiedAt?: true
    deactivatedAt?: true
  }

  export type ActivationDeviceCountAggregateInputType = {
    id?: true
    activationKeyId?: true
    deviceId?: true
    deviceName?: true
    os?: true
    status?: true
    activatedAt?: true
    lastVerifiedAt?: true
    deactivatedAt?: true
    _all?: true
  }

  export type ActivationDeviceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivationDevice to aggregate.
     */
    where?: ActivationDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationDevices to fetch.
     */
    orderBy?: ActivationDeviceOrderByWithRelationInput | ActivationDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivationDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationDevices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ActivationDevices
    **/
    _count?: true | ActivationDeviceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivationDeviceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivationDeviceMaxAggregateInputType
  }

  export type GetActivationDeviceAggregateType<T extends ActivationDeviceAggregateArgs> = {
        [P in keyof T & keyof AggregateActivationDevice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivationDevice[P]>
      : GetScalarType<T[P], AggregateActivationDevice[P]>
  }




  export type ActivationDeviceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivationDeviceWhereInput
    orderBy?: ActivationDeviceOrderByWithAggregationInput | ActivationDeviceOrderByWithAggregationInput[]
    by: ActivationDeviceScalarFieldEnum[] | ActivationDeviceScalarFieldEnum
    having?: ActivationDeviceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivationDeviceCountAggregateInputType | true
    _min?: ActivationDeviceMinAggregateInputType
    _max?: ActivationDeviceMaxAggregateInputType
  }

  export type ActivationDeviceGroupByOutputType = {
    id: string
    activationKeyId: string
    deviceId: string
    deviceName: string
    os: string
    status: string
    activatedAt: Date
    lastVerifiedAt: Date
    deactivatedAt: Date | null
    _count: ActivationDeviceCountAggregateOutputType | null
    _min: ActivationDeviceMinAggregateOutputType | null
    _max: ActivationDeviceMaxAggregateOutputType | null
  }

  type GetActivationDeviceGroupByPayload<T extends ActivationDeviceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivationDeviceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivationDeviceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivationDeviceGroupByOutputType[P]>
            : GetScalarType<T[P], ActivationDeviceGroupByOutputType[P]>
        }
      >
    >


  export type ActivationDeviceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    activationKeyId?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    status?: boolean
    activatedAt?: boolean
    lastVerifiedAt?: boolean
    deactivatedAt?: boolean
    activationKey?: boolean | ActivationKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activationDevice"]>

  export type ActivationDeviceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    activationKeyId?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    status?: boolean
    activatedAt?: boolean
    lastVerifiedAt?: boolean
    deactivatedAt?: boolean
    activationKey?: boolean | ActivationKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activationDevice"]>

  export type ActivationDeviceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    activationKeyId?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    status?: boolean
    activatedAt?: boolean
    lastVerifiedAt?: boolean
    deactivatedAt?: boolean
    activationKey?: boolean | ActivationKeyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["activationDevice"]>

  export type ActivationDeviceSelectScalar = {
    id?: boolean
    activationKeyId?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    status?: boolean
    activatedAt?: boolean
    lastVerifiedAt?: boolean
    deactivatedAt?: boolean
  }

  export type ActivationDeviceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "activationKeyId" | "deviceId" | "deviceName" | "os" | "status" | "activatedAt" | "lastVerifiedAt" | "deactivatedAt", ExtArgs["result"]["activationDevice"]>
  export type ActivationDeviceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    activationKey?: boolean | ActivationKeyDefaultArgs<ExtArgs>
  }
  export type ActivationDeviceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    activationKey?: boolean | ActivationKeyDefaultArgs<ExtArgs>
  }
  export type ActivationDeviceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    activationKey?: boolean | ActivationKeyDefaultArgs<ExtArgs>
  }

  export type $ActivationDevicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ActivationDevice"
    objects: {
      activationKey: Prisma.$ActivationKeyPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      activationKeyId: string
      deviceId: string
      deviceName: string
      os: string
      status: string
      activatedAt: Date
      lastVerifiedAt: Date
      deactivatedAt: Date | null
    }, ExtArgs["result"]["activationDevice"]>
    composites: {}
  }

  type ActivationDeviceGetPayload<S extends boolean | null | undefined | ActivationDeviceDefaultArgs> = $Result.GetResult<Prisma.$ActivationDevicePayload, S>

  type ActivationDeviceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivationDeviceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivationDeviceCountAggregateInputType | true
    }

  export interface ActivationDeviceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ActivationDevice'], meta: { name: 'ActivationDevice' } }
    /**
     * Find zero or one ActivationDevice that matches the filter.
     * @param {ActivationDeviceFindUniqueArgs} args - Arguments to find a ActivationDevice
     * @example
     * // Get one ActivationDevice
     * const activationDevice = await prisma.activationDevice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivationDeviceFindUniqueArgs>(args: SelectSubset<T, ActivationDeviceFindUniqueArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ActivationDevice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivationDeviceFindUniqueOrThrowArgs} args - Arguments to find a ActivationDevice
     * @example
     * // Get one ActivationDevice
     * const activationDevice = await prisma.activationDevice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivationDeviceFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivationDeviceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivationDevice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationDeviceFindFirstArgs} args - Arguments to find a ActivationDevice
     * @example
     * // Get one ActivationDevice
     * const activationDevice = await prisma.activationDevice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivationDeviceFindFirstArgs>(args?: SelectSubset<T, ActivationDeviceFindFirstArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivationDevice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationDeviceFindFirstOrThrowArgs} args - Arguments to find a ActivationDevice
     * @example
     * // Get one ActivationDevice
     * const activationDevice = await prisma.activationDevice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivationDeviceFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivationDeviceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivationDevices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationDeviceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActivationDevices
     * const activationDevices = await prisma.activationDevice.findMany()
     * 
     * // Get first 10 ActivationDevices
     * const activationDevices = await prisma.activationDevice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activationDeviceWithIdOnly = await prisma.activationDevice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivationDeviceFindManyArgs>(args?: SelectSubset<T, ActivationDeviceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ActivationDevice.
     * @param {ActivationDeviceCreateArgs} args - Arguments to create a ActivationDevice.
     * @example
     * // Create one ActivationDevice
     * const ActivationDevice = await prisma.activationDevice.create({
     *   data: {
     *     // ... data to create a ActivationDevice
     *   }
     * })
     * 
     */
    create<T extends ActivationDeviceCreateArgs>(args: SelectSubset<T, ActivationDeviceCreateArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ActivationDevices.
     * @param {ActivationDeviceCreateManyArgs} args - Arguments to create many ActivationDevices.
     * @example
     * // Create many ActivationDevices
     * const activationDevice = await prisma.activationDevice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivationDeviceCreateManyArgs>(args?: SelectSubset<T, ActivationDeviceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ActivationDevices and returns the data saved in the database.
     * @param {ActivationDeviceCreateManyAndReturnArgs} args - Arguments to create many ActivationDevices.
     * @example
     * // Create many ActivationDevices
     * const activationDevice = await prisma.activationDevice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ActivationDevices and only return the `id`
     * const activationDeviceWithIdOnly = await prisma.activationDevice.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ActivationDeviceCreateManyAndReturnArgs>(args?: SelectSubset<T, ActivationDeviceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ActivationDevice.
     * @param {ActivationDeviceDeleteArgs} args - Arguments to delete one ActivationDevice.
     * @example
     * // Delete one ActivationDevice
     * const ActivationDevice = await prisma.activationDevice.delete({
     *   where: {
     *     // ... filter to delete one ActivationDevice
     *   }
     * })
     * 
     */
    delete<T extends ActivationDeviceDeleteArgs>(args: SelectSubset<T, ActivationDeviceDeleteArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ActivationDevice.
     * @param {ActivationDeviceUpdateArgs} args - Arguments to update one ActivationDevice.
     * @example
     * // Update one ActivationDevice
     * const activationDevice = await prisma.activationDevice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivationDeviceUpdateArgs>(args: SelectSubset<T, ActivationDeviceUpdateArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ActivationDevices.
     * @param {ActivationDeviceDeleteManyArgs} args - Arguments to filter ActivationDevices to delete.
     * @example
     * // Delete a few ActivationDevices
     * const { count } = await prisma.activationDevice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivationDeviceDeleteManyArgs>(args?: SelectSubset<T, ActivationDeviceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivationDevices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationDeviceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActivationDevices
     * const activationDevice = await prisma.activationDevice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivationDeviceUpdateManyArgs>(args: SelectSubset<T, ActivationDeviceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivationDevices and returns the data updated in the database.
     * @param {ActivationDeviceUpdateManyAndReturnArgs} args - Arguments to update many ActivationDevices.
     * @example
     * // Update many ActivationDevices
     * const activationDevice = await prisma.activationDevice.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ActivationDevices and only return the `id`
     * const activationDeviceWithIdOnly = await prisma.activationDevice.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ActivationDeviceUpdateManyAndReturnArgs>(args: SelectSubset<T, ActivationDeviceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ActivationDevice.
     * @param {ActivationDeviceUpsertArgs} args - Arguments to update or create a ActivationDevice.
     * @example
     * // Update or create a ActivationDevice
     * const activationDevice = await prisma.activationDevice.upsert({
     *   create: {
     *     // ... data to create a ActivationDevice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActivationDevice we want to update
     *   }
     * })
     */
    upsert<T extends ActivationDeviceUpsertArgs>(args: SelectSubset<T, ActivationDeviceUpsertArgs<ExtArgs>>): Prisma__ActivationDeviceClient<$Result.GetResult<Prisma.$ActivationDevicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ActivationDevices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationDeviceCountArgs} args - Arguments to filter ActivationDevices to count.
     * @example
     * // Count the number of ActivationDevices
     * const count = await prisma.activationDevice.count({
     *   where: {
     *     // ... the filter for the ActivationDevices we want to count
     *   }
     * })
    **/
    count<T extends ActivationDeviceCountArgs>(
      args?: Subset<T, ActivationDeviceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivationDeviceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ActivationDevice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationDeviceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ActivationDeviceAggregateArgs>(args: Subset<T, ActivationDeviceAggregateArgs>): Prisma.PrismaPromise<GetActivationDeviceAggregateType<T>>

    /**
     * Group by ActivationDevice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivationDeviceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ActivationDeviceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivationDeviceGroupByArgs['orderBy'] }
        : { orderBy?: ActivationDeviceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ActivationDeviceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivationDeviceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ActivationDevice model
   */
  readonly fields: ActivationDeviceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ActivationDevice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivationDeviceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    activationKey<T extends ActivationKeyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ActivationKeyDefaultArgs<ExtArgs>>): Prisma__ActivationKeyClient<$Result.GetResult<Prisma.$ActivationKeyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ActivationDevice model
   */
  interface ActivationDeviceFieldRefs {
    readonly id: FieldRef<"ActivationDevice", 'String'>
    readonly activationKeyId: FieldRef<"ActivationDevice", 'String'>
    readonly deviceId: FieldRef<"ActivationDevice", 'String'>
    readonly deviceName: FieldRef<"ActivationDevice", 'String'>
    readonly os: FieldRef<"ActivationDevice", 'String'>
    readonly status: FieldRef<"ActivationDevice", 'String'>
    readonly activatedAt: FieldRef<"ActivationDevice", 'DateTime'>
    readonly lastVerifiedAt: FieldRef<"ActivationDevice", 'DateTime'>
    readonly deactivatedAt: FieldRef<"ActivationDevice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ActivationDevice findUnique
   */
  export type ActivationDeviceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * Filter, which ActivationDevice to fetch.
     */
    where: ActivationDeviceWhereUniqueInput
  }

  /**
   * ActivationDevice findUniqueOrThrow
   */
  export type ActivationDeviceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * Filter, which ActivationDevice to fetch.
     */
    where: ActivationDeviceWhereUniqueInput
  }

  /**
   * ActivationDevice findFirst
   */
  export type ActivationDeviceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * Filter, which ActivationDevice to fetch.
     */
    where?: ActivationDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationDevices to fetch.
     */
    orderBy?: ActivationDeviceOrderByWithRelationInput | ActivationDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivationDevices.
     */
    cursor?: ActivationDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationDevices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivationDevices.
     */
    distinct?: ActivationDeviceScalarFieldEnum | ActivationDeviceScalarFieldEnum[]
  }

  /**
   * ActivationDevice findFirstOrThrow
   */
  export type ActivationDeviceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * Filter, which ActivationDevice to fetch.
     */
    where?: ActivationDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationDevices to fetch.
     */
    orderBy?: ActivationDeviceOrderByWithRelationInput | ActivationDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivationDevices.
     */
    cursor?: ActivationDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationDevices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivationDevices.
     */
    distinct?: ActivationDeviceScalarFieldEnum | ActivationDeviceScalarFieldEnum[]
  }

  /**
   * ActivationDevice findMany
   */
  export type ActivationDeviceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * Filter, which ActivationDevices to fetch.
     */
    where?: ActivationDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivationDevices to fetch.
     */
    orderBy?: ActivationDeviceOrderByWithRelationInput | ActivationDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ActivationDevices.
     */
    cursor?: ActivationDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivationDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivationDevices.
     */
    skip?: number
    distinct?: ActivationDeviceScalarFieldEnum | ActivationDeviceScalarFieldEnum[]
  }

  /**
   * ActivationDevice create
   */
  export type ActivationDeviceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * The data needed to create a ActivationDevice.
     */
    data: XOR<ActivationDeviceCreateInput, ActivationDeviceUncheckedCreateInput>
  }

  /**
   * ActivationDevice createMany
   */
  export type ActivationDeviceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActivationDevices.
     */
    data: ActivationDeviceCreateManyInput | ActivationDeviceCreateManyInput[]
  }

  /**
   * ActivationDevice createManyAndReturn
   */
  export type ActivationDeviceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * The data used to create many ActivationDevices.
     */
    data: ActivationDeviceCreateManyInput | ActivationDeviceCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivationDevice update
   */
  export type ActivationDeviceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * The data needed to update a ActivationDevice.
     */
    data: XOR<ActivationDeviceUpdateInput, ActivationDeviceUncheckedUpdateInput>
    /**
     * Choose, which ActivationDevice to update.
     */
    where: ActivationDeviceWhereUniqueInput
  }

  /**
   * ActivationDevice updateMany
   */
  export type ActivationDeviceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ActivationDevices.
     */
    data: XOR<ActivationDeviceUpdateManyMutationInput, ActivationDeviceUncheckedUpdateManyInput>
    /**
     * Filter which ActivationDevices to update
     */
    where?: ActivationDeviceWhereInput
    /**
     * Limit how many ActivationDevices to update.
     */
    limit?: number
  }

  /**
   * ActivationDevice updateManyAndReturn
   */
  export type ActivationDeviceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * The data used to update ActivationDevices.
     */
    data: XOR<ActivationDeviceUpdateManyMutationInput, ActivationDeviceUncheckedUpdateManyInput>
    /**
     * Filter which ActivationDevices to update
     */
    where?: ActivationDeviceWhereInput
    /**
     * Limit how many ActivationDevices to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ActivationDevice upsert
   */
  export type ActivationDeviceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * The filter to search for the ActivationDevice to update in case it exists.
     */
    where: ActivationDeviceWhereUniqueInput
    /**
     * In case the ActivationDevice found by the `where` argument doesn't exist, create a new ActivationDevice with this data.
     */
    create: XOR<ActivationDeviceCreateInput, ActivationDeviceUncheckedCreateInput>
    /**
     * In case the ActivationDevice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivationDeviceUpdateInput, ActivationDeviceUncheckedUpdateInput>
  }

  /**
   * ActivationDevice delete
   */
  export type ActivationDeviceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
    /**
     * Filter which ActivationDevice to delete.
     */
    where: ActivationDeviceWhereUniqueInput
  }

  /**
   * ActivationDevice deleteMany
   */
  export type ActivationDeviceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivationDevices to delete
     */
    where?: ActivationDeviceWhereInput
    /**
     * Limit how many ActivationDevices to delete.
     */
    limit?: number
  }

  /**
   * ActivationDevice without action
   */
  export type ActivationDeviceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivationDevice
     */
    select?: ActivationDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivationDevice
     */
    omit?: ActivationDeviceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ActivationDeviceInclude<ExtArgs> | null
  }


  /**
   * Model ClientDevice
   */

  export type AggregateClientDevice = {
    _count: ClientDeviceCountAggregateOutputType | null
    _min: ClientDeviceMinAggregateOutputType | null
    _max: ClientDeviceMaxAggregateOutputType | null
  }

  export type ClientDeviceMinAggregateOutputType = {
    id: string | null
    deviceId: string | null
    deviceName: string | null
    os: string | null
    tokenHash: string | null
    status: string | null
    confirmedAt: Date | null
    lastSeenAt: Date | null
    lastIp: string | null
  }

  export type ClientDeviceMaxAggregateOutputType = {
    id: string | null
    deviceId: string | null
    deviceName: string | null
    os: string | null
    tokenHash: string | null
    status: string | null
    confirmedAt: Date | null
    lastSeenAt: Date | null
    lastIp: string | null
  }

  export type ClientDeviceCountAggregateOutputType = {
    id: number
    deviceId: number
    deviceName: number
    os: number
    tokenHash: number
    status: number
    confirmedAt: number
    lastSeenAt: number
    lastIp: number
    _all: number
  }


  export type ClientDeviceMinAggregateInputType = {
    id?: true
    deviceId?: true
    deviceName?: true
    os?: true
    tokenHash?: true
    status?: true
    confirmedAt?: true
    lastSeenAt?: true
    lastIp?: true
  }

  export type ClientDeviceMaxAggregateInputType = {
    id?: true
    deviceId?: true
    deviceName?: true
    os?: true
    tokenHash?: true
    status?: true
    confirmedAt?: true
    lastSeenAt?: true
    lastIp?: true
  }

  export type ClientDeviceCountAggregateInputType = {
    id?: true
    deviceId?: true
    deviceName?: true
    os?: true
    tokenHash?: true
    status?: true
    confirmedAt?: true
    lastSeenAt?: true
    lastIp?: true
    _all?: true
  }

  export type ClientDeviceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientDevice to aggregate.
     */
    where?: ClientDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientDevices to fetch.
     */
    orderBy?: ClientDeviceOrderByWithRelationInput | ClientDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClientDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientDevices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClientDevices
    **/
    _count?: true | ClientDeviceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClientDeviceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClientDeviceMaxAggregateInputType
  }

  export type GetClientDeviceAggregateType<T extends ClientDeviceAggregateArgs> = {
        [P in keyof T & keyof AggregateClientDevice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClientDevice[P]>
      : GetScalarType<T[P], AggregateClientDevice[P]>
  }




  export type ClientDeviceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientDeviceWhereInput
    orderBy?: ClientDeviceOrderByWithAggregationInput | ClientDeviceOrderByWithAggregationInput[]
    by: ClientDeviceScalarFieldEnum[] | ClientDeviceScalarFieldEnum
    having?: ClientDeviceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClientDeviceCountAggregateInputType | true
    _min?: ClientDeviceMinAggregateInputType
    _max?: ClientDeviceMaxAggregateInputType
  }

  export type ClientDeviceGroupByOutputType = {
    id: string
    deviceId: string
    deviceName: string
    os: string
    tokenHash: string
    status: string
    confirmedAt: Date
    lastSeenAt: Date
    lastIp: string | null
    _count: ClientDeviceCountAggregateOutputType | null
    _min: ClientDeviceMinAggregateOutputType | null
    _max: ClientDeviceMaxAggregateOutputType | null
  }

  type GetClientDeviceGroupByPayload<T extends ClientDeviceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClientDeviceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClientDeviceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientDeviceGroupByOutputType[P]>
            : GetScalarType<T[P], ClientDeviceGroupByOutputType[P]>
        }
      >
    >


  export type ClientDeviceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    tokenHash?: boolean
    status?: boolean
    confirmedAt?: boolean
    lastSeenAt?: boolean
    lastIp?: boolean
  }, ExtArgs["result"]["clientDevice"]>

  export type ClientDeviceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    tokenHash?: boolean
    status?: boolean
    confirmedAt?: boolean
    lastSeenAt?: boolean
    lastIp?: boolean
  }, ExtArgs["result"]["clientDevice"]>

  export type ClientDeviceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    tokenHash?: boolean
    status?: boolean
    confirmedAt?: boolean
    lastSeenAt?: boolean
    lastIp?: boolean
  }, ExtArgs["result"]["clientDevice"]>

  export type ClientDeviceSelectScalar = {
    id?: boolean
    deviceId?: boolean
    deviceName?: boolean
    os?: boolean
    tokenHash?: boolean
    status?: boolean
    confirmedAt?: boolean
    lastSeenAt?: boolean
    lastIp?: boolean
  }

  export type ClientDeviceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "deviceId" | "deviceName" | "os" | "tokenHash" | "status" | "confirmedAt" | "lastSeenAt" | "lastIp", ExtArgs["result"]["clientDevice"]>

  export type $ClientDevicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClientDevice"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      deviceId: string
      deviceName: string
      os: string
      tokenHash: string
      status: string
      confirmedAt: Date
      lastSeenAt: Date
      lastIp: string | null
    }, ExtArgs["result"]["clientDevice"]>
    composites: {}
  }

  type ClientDeviceGetPayload<S extends boolean | null | undefined | ClientDeviceDefaultArgs> = $Result.GetResult<Prisma.$ClientDevicePayload, S>

  type ClientDeviceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClientDeviceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClientDeviceCountAggregateInputType | true
    }

  export interface ClientDeviceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClientDevice'], meta: { name: 'ClientDevice' } }
    /**
     * Find zero or one ClientDevice that matches the filter.
     * @param {ClientDeviceFindUniqueArgs} args - Arguments to find a ClientDevice
     * @example
     * // Get one ClientDevice
     * const clientDevice = await prisma.clientDevice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientDeviceFindUniqueArgs>(args: SelectSubset<T, ClientDeviceFindUniqueArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClientDevice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClientDeviceFindUniqueOrThrowArgs} args - Arguments to find a ClientDevice
     * @example
     * // Get one ClientDevice
     * const clientDevice = await prisma.clientDevice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientDeviceFindUniqueOrThrowArgs>(args: SelectSubset<T, ClientDeviceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClientDevice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientDeviceFindFirstArgs} args - Arguments to find a ClientDevice
     * @example
     * // Get one ClientDevice
     * const clientDevice = await prisma.clientDevice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientDeviceFindFirstArgs>(args?: SelectSubset<T, ClientDeviceFindFirstArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClientDevice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientDeviceFindFirstOrThrowArgs} args - Arguments to find a ClientDevice
     * @example
     * // Get one ClientDevice
     * const clientDevice = await prisma.clientDevice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientDeviceFindFirstOrThrowArgs>(args?: SelectSubset<T, ClientDeviceFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClientDevices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientDeviceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClientDevices
     * const clientDevices = await prisma.clientDevice.findMany()
     * 
     * // Get first 10 ClientDevices
     * const clientDevices = await prisma.clientDevice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clientDeviceWithIdOnly = await prisma.clientDevice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClientDeviceFindManyArgs>(args?: SelectSubset<T, ClientDeviceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClientDevice.
     * @param {ClientDeviceCreateArgs} args - Arguments to create a ClientDevice.
     * @example
     * // Create one ClientDevice
     * const ClientDevice = await prisma.clientDevice.create({
     *   data: {
     *     // ... data to create a ClientDevice
     *   }
     * })
     * 
     */
    create<T extends ClientDeviceCreateArgs>(args: SelectSubset<T, ClientDeviceCreateArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClientDevices.
     * @param {ClientDeviceCreateManyArgs} args - Arguments to create many ClientDevices.
     * @example
     * // Create many ClientDevices
     * const clientDevice = await prisma.clientDevice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClientDeviceCreateManyArgs>(args?: SelectSubset<T, ClientDeviceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClientDevices and returns the data saved in the database.
     * @param {ClientDeviceCreateManyAndReturnArgs} args - Arguments to create many ClientDevices.
     * @example
     * // Create many ClientDevices
     * const clientDevice = await prisma.clientDevice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClientDevices and only return the `id`
     * const clientDeviceWithIdOnly = await prisma.clientDevice.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClientDeviceCreateManyAndReturnArgs>(args?: SelectSubset<T, ClientDeviceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClientDevice.
     * @param {ClientDeviceDeleteArgs} args - Arguments to delete one ClientDevice.
     * @example
     * // Delete one ClientDevice
     * const ClientDevice = await prisma.clientDevice.delete({
     *   where: {
     *     // ... filter to delete one ClientDevice
     *   }
     * })
     * 
     */
    delete<T extends ClientDeviceDeleteArgs>(args: SelectSubset<T, ClientDeviceDeleteArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClientDevice.
     * @param {ClientDeviceUpdateArgs} args - Arguments to update one ClientDevice.
     * @example
     * // Update one ClientDevice
     * const clientDevice = await prisma.clientDevice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClientDeviceUpdateArgs>(args: SelectSubset<T, ClientDeviceUpdateArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClientDevices.
     * @param {ClientDeviceDeleteManyArgs} args - Arguments to filter ClientDevices to delete.
     * @example
     * // Delete a few ClientDevices
     * const { count } = await prisma.clientDevice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClientDeviceDeleteManyArgs>(args?: SelectSubset<T, ClientDeviceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClientDevices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientDeviceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClientDevices
     * const clientDevice = await prisma.clientDevice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClientDeviceUpdateManyArgs>(args: SelectSubset<T, ClientDeviceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClientDevices and returns the data updated in the database.
     * @param {ClientDeviceUpdateManyAndReturnArgs} args - Arguments to update many ClientDevices.
     * @example
     * // Update many ClientDevices
     * const clientDevice = await prisma.clientDevice.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClientDevices and only return the `id`
     * const clientDeviceWithIdOnly = await prisma.clientDevice.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClientDeviceUpdateManyAndReturnArgs>(args: SelectSubset<T, ClientDeviceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClientDevice.
     * @param {ClientDeviceUpsertArgs} args - Arguments to update or create a ClientDevice.
     * @example
     * // Update or create a ClientDevice
     * const clientDevice = await prisma.clientDevice.upsert({
     *   create: {
     *     // ... data to create a ClientDevice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClientDevice we want to update
     *   }
     * })
     */
    upsert<T extends ClientDeviceUpsertArgs>(args: SelectSubset<T, ClientDeviceUpsertArgs<ExtArgs>>): Prisma__ClientDeviceClient<$Result.GetResult<Prisma.$ClientDevicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClientDevices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientDeviceCountArgs} args - Arguments to filter ClientDevices to count.
     * @example
     * // Count the number of ClientDevices
     * const count = await prisma.clientDevice.count({
     *   where: {
     *     // ... the filter for the ClientDevices we want to count
     *   }
     * })
    **/
    count<T extends ClientDeviceCountArgs>(
      args?: Subset<T, ClientDeviceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientDeviceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClientDevice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientDeviceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClientDeviceAggregateArgs>(args: Subset<T, ClientDeviceAggregateArgs>): Prisma.PrismaPromise<GetClientDeviceAggregateType<T>>

    /**
     * Group by ClientDevice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientDeviceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClientDeviceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientDeviceGroupByArgs['orderBy'] }
        : { orderBy?: ClientDeviceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClientDeviceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientDeviceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClientDevice model
   */
  readonly fields: ClientDeviceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClientDevice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientDeviceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClientDevice model
   */
  interface ClientDeviceFieldRefs {
    readonly id: FieldRef<"ClientDevice", 'String'>
    readonly deviceId: FieldRef<"ClientDevice", 'String'>
    readonly deviceName: FieldRef<"ClientDevice", 'String'>
    readonly os: FieldRef<"ClientDevice", 'String'>
    readonly tokenHash: FieldRef<"ClientDevice", 'String'>
    readonly status: FieldRef<"ClientDevice", 'String'>
    readonly confirmedAt: FieldRef<"ClientDevice", 'DateTime'>
    readonly lastSeenAt: FieldRef<"ClientDevice", 'DateTime'>
    readonly lastIp: FieldRef<"ClientDevice", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ClientDevice findUnique
   */
  export type ClientDeviceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * Filter, which ClientDevice to fetch.
     */
    where: ClientDeviceWhereUniqueInput
  }

  /**
   * ClientDevice findUniqueOrThrow
   */
  export type ClientDeviceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * Filter, which ClientDevice to fetch.
     */
    where: ClientDeviceWhereUniqueInput
  }

  /**
   * ClientDevice findFirst
   */
  export type ClientDeviceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * Filter, which ClientDevice to fetch.
     */
    where?: ClientDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientDevices to fetch.
     */
    orderBy?: ClientDeviceOrderByWithRelationInput | ClientDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientDevices.
     */
    cursor?: ClientDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientDevices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientDevices.
     */
    distinct?: ClientDeviceScalarFieldEnum | ClientDeviceScalarFieldEnum[]
  }

  /**
   * ClientDevice findFirstOrThrow
   */
  export type ClientDeviceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * Filter, which ClientDevice to fetch.
     */
    where?: ClientDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientDevices to fetch.
     */
    orderBy?: ClientDeviceOrderByWithRelationInput | ClientDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClientDevices.
     */
    cursor?: ClientDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientDevices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClientDevices.
     */
    distinct?: ClientDeviceScalarFieldEnum | ClientDeviceScalarFieldEnum[]
  }

  /**
   * ClientDevice findMany
   */
  export type ClientDeviceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * Filter, which ClientDevices to fetch.
     */
    where?: ClientDeviceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClientDevices to fetch.
     */
    orderBy?: ClientDeviceOrderByWithRelationInput | ClientDeviceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClientDevices.
     */
    cursor?: ClientDeviceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClientDevices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClientDevices.
     */
    skip?: number
    distinct?: ClientDeviceScalarFieldEnum | ClientDeviceScalarFieldEnum[]
  }

  /**
   * ClientDevice create
   */
  export type ClientDeviceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * The data needed to create a ClientDevice.
     */
    data: XOR<ClientDeviceCreateInput, ClientDeviceUncheckedCreateInput>
  }

  /**
   * ClientDevice createMany
   */
  export type ClientDeviceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClientDevices.
     */
    data: ClientDeviceCreateManyInput | ClientDeviceCreateManyInput[]
  }

  /**
   * ClientDevice createManyAndReturn
   */
  export type ClientDeviceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * The data used to create many ClientDevices.
     */
    data: ClientDeviceCreateManyInput | ClientDeviceCreateManyInput[]
  }

  /**
   * ClientDevice update
   */
  export type ClientDeviceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * The data needed to update a ClientDevice.
     */
    data: XOR<ClientDeviceUpdateInput, ClientDeviceUncheckedUpdateInput>
    /**
     * Choose, which ClientDevice to update.
     */
    where: ClientDeviceWhereUniqueInput
  }

  /**
   * ClientDevice updateMany
   */
  export type ClientDeviceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClientDevices.
     */
    data: XOR<ClientDeviceUpdateManyMutationInput, ClientDeviceUncheckedUpdateManyInput>
    /**
     * Filter which ClientDevices to update
     */
    where?: ClientDeviceWhereInput
    /**
     * Limit how many ClientDevices to update.
     */
    limit?: number
  }

  /**
   * ClientDevice updateManyAndReturn
   */
  export type ClientDeviceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * The data used to update ClientDevices.
     */
    data: XOR<ClientDeviceUpdateManyMutationInput, ClientDeviceUncheckedUpdateManyInput>
    /**
     * Filter which ClientDevices to update
     */
    where?: ClientDeviceWhereInput
    /**
     * Limit how many ClientDevices to update.
     */
    limit?: number
  }

  /**
   * ClientDevice upsert
   */
  export type ClientDeviceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * The filter to search for the ClientDevice to update in case it exists.
     */
    where: ClientDeviceWhereUniqueInput
    /**
     * In case the ClientDevice found by the `where` argument doesn't exist, create a new ClientDevice with this data.
     */
    create: XOR<ClientDeviceCreateInput, ClientDeviceUncheckedCreateInput>
    /**
     * In case the ClientDevice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientDeviceUpdateInput, ClientDeviceUncheckedUpdateInput>
  }

  /**
   * ClientDevice delete
   */
  export type ClientDeviceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
    /**
     * Filter which ClientDevice to delete.
     */
    where: ClientDeviceWhereUniqueInput
  }

  /**
   * ClientDevice deleteMany
   */
  export type ClientDeviceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClientDevices to delete
     */
    where?: ClientDeviceWhereInput
    /**
     * Limit how many ClientDevices to delete.
     */
    limit?: number
  }

  /**
   * ClientDevice without action
   */
  export type ClientDeviceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientDevice
     */
    select?: ClientDeviceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClientDevice
     */
    omit?: ClientDeviceOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SuperAdminScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    contact: 'contact',
    position: 'position',
    country: 'country',
    state: 'state',
    city: 'city',
    zipCode: 'zipCode',
    fullAddress: 'fullAddress',
    createdAt: 'createdAt',
    currentSessionToken: 'currentSessionToken',
    lastLoginAt: 'lastLoginAt',
    role: 'role',
    basicComplete: 'basicComplete',
    addressComplete: 'addressComplete'
  };

  export type SuperAdminScalarFieldEnum = (typeof SuperAdminScalarFieldEnum)[keyof typeof SuperAdminScalarFieldEnum]


  export const TenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    contact: 'contact',
    fullAddress: 'fullAddress',
    logo: 'logo',
    certificateName: 'certificateName',
    stamp: 'stamp',
    sign: 'sign',
    position: 'position',
    country: 'country',
    state: 'state',
    city: 'city',
    zipCode: 'zipCode',
    instituteName: 'instituteName',
    tenantId: 'tenantId',
    slug: 'slug',
    email: 'email',
    businessEmail: 'businessEmail',
    password: 'password',
    encryptedPassword: 'encryptedPassword',
    dbUrl: 'dbUrl',
    parentTenantId: 'parentTenantId',
    loginCode: 'loginCode',
    createdAt: 'createdAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const SubscriptionPlanScalarFieldEnum: {
    id: 'id',
    code: 'code',
    name: 'name',
    months: 'months',
    price: 'price',
    currency: 'currency',
    active: 'active',
    updatedAt: 'updatedAt'
  };

  export type SubscriptionPlanScalarFieldEnum = (typeof SubscriptionPlanScalarFieldEnum)[keyof typeof SubscriptionPlanScalarFieldEnum]


  export const PortalSubscriptionScalarFieldEnum: {
    id: 'id',
    email: 'email',
    clientId: 'clientId',
    plan: 'plan',
    startDate: 'startDate',
    expiryDate: 'expiryDate',
    status: 'status',
    syncTokenHash: 'syncTokenHash',
    maxUsers: 'maxUsers',
    updatedAt: 'updatedAt'
  };

  export type PortalSubscriptionScalarFieldEnum = (typeof PortalSubscriptionScalarFieldEnum)[keyof typeof PortalSubscriptionScalarFieldEnum]


  export const PortalPaymentScalarFieldEnum: {
    id: 'id',
    email: 'email',
    planCode: 'planCode',
    amount: 'amount',
    currency: 'currency',
    maxUsers: 'maxUsers',
    orderId: 'orderId',
    paymentId: 'paymentId',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type PortalPaymentScalarFieldEnum = (typeof PortalPaymentScalarFieldEnum)[keyof typeof PortalPaymentScalarFieldEnum]


  export const SaasAdminScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    createdAt: 'createdAt'
  };

  export type SaasAdminScalarFieldEnum = (typeof SaasAdminScalarFieldEnum)[keyof typeof SaasAdminScalarFieldEnum]


  export const AppSettingScalarFieldEnum: {
    key: 'key',
    value: 'value',
    updatedAt: 'updatedAt'
  };

  export type AppSettingScalarFieldEnum = (typeof AppSettingScalarFieldEnum)[keyof typeof AppSettingScalarFieldEnum]


  export const ActivationKeyScalarFieldEnum: {
    id: 'id',
    key: 'key',
    tenantId: 'tenantId',
    instituteName: 'instituteName',
    companyName: 'companyName',
    maxActivations: 'maxActivations',
    transferLimit: 'transferLimit',
    transfersUsed: 'transfersUsed',
    status: 'status',
    firstActivatedAt: 'firstActivatedAt',
    createdAt: 'createdAt',
    companyId: 'companyId',
    kind: 'kind'
  };

  export type ActivationKeyScalarFieldEnum = (typeof ActivationKeyScalarFieldEnum)[keyof typeof ActivationKeyScalarFieldEnum]


  export const ActivationDeviceScalarFieldEnum: {
    id: 'id',
    activationKeyId: 'activationKeyId',
    deviceId: 'deviceId',
    deviceName: 'deviceName',
    os: 'os',
    status: 'status',
    activatedAt: 'activatedAt',
    lastVerifiedAt: 'lastVerifiedAt',
    deactivatedAt: 'deactivatedAt'
  };

  export type ActivationDeviceScalarFieldEnum = (typeof ActivationDeviceScalarFieldEnum)[keyof typeof ActivationDeviceScalarFieldEnum]


  export const ClientDeviceScalarFieldEnum: {
    id: 'id',
    deviceId: 'deviceId',
    deviceName: 'deviceName',
    os: 'os',
    tokenHash: 'tokenHash',
    status: 'status',
    confirmedAt: 'confirmedAt',
    lastSeenAt: 'lastSeenAt',
    lastIp: 'lastIp'
  };

  export type ClientDeviceScalarFieldEnum = (typeof ClientDeviceScalarFieldEnum)[keyof typeof ClientDeviceScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type SuperAdminWhereInput = {
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    id?: StringFilter<"SuperAdmin"> | string
    name?: StringFilter<"SuperAdmin"> | string
    email?: StringFilter<"SuperAdmin"> | string
    password?: StringFilter<"SuperAdmin"> | string
    contact?: StringNullableFilter<"SuperAdmin"> | string | null
    position?: StringFilter<"SuperAdmin"> | string
    country?: StringNullableFilter<"SuperAdmin"> | string | null
    state?: StringNullableFilter<"SuperAdmin"> | string | null
    city?: StringNullableFilter<"SuperAdmin"> | string | null
    zipCode?: StringNullableFilter<"SuperAdmin"> | string | null
    fullAddress?: StringNullableFilter<"SuperAdmin"> | string | null
    createdAt?: DateTimeFilter<"SuperAdmin"> | Date | string
    currentSessionToken?: StringNullableFilter<"SuperAdmin"> | string | null
    lastLoginAt?: DateTimeNullableFilter<"SuperAdmin"> | Date | string | null
    role?: EnumRoleFilter<"SuperAdmin"> | $Enums.Role
    basicComplete?: BoolFilter<"SuperAdmin"> | boolean
    addressComplete?: BoolFilter<"SuperAdmin"> | boolean
  }

  export type SuperAdminOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    contact?: SortOrderInput | SortOrder
    position?: SortOrder
    country?: SortOrderInput | SortOrder
    state?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    zipCode?: SortOrderInput | SortOrder
    fullAddress?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    currentSessionToken?: SortOrderInput | SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    role?: SortOrder
    basicComplete?: SortOrder
    addressComplete?: SortOrder
  }

  export type SuperAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: SuperAdminWhereInput | SuperAdminWhereInput[]
    OR?: SuperAdminWhereInput[]
    NOT?: SuperAdminWhereInput | SuperAdminWhereInput[]
    name?: StringFilter<"SuperAdmin"> | string
    password?: StringFilter<"SuperAdmin"> | string
    contact?: StringNullableFilter<"SuperAdmin"> | string | null
    position?: StringFilter<"SuperAdmin"> | string
    country?: StringNullableFilter<"SuperAdmin"> | string | null
    state?: StringNullableFilter<"SuperAdmin"> | string | null
    city?: StringNullableFilter<"SuperAdmin"> | string | null
    zipCode?: StringNullableFilter<"SuperAdmin"> | string | null
    fullAddress?: StringNullableFilter<"SuperAdmin"> | string | null
    createdAt?: DateTimeFilter<"SuperAdmin"> | Date | string
    currentSessionToken?: StringNullableFilter<"SuperAdmin"> | string | null
    lastLoginAt?: DateTimeNullableFilter<"SuperAdmin"> | Date | string | null
    role?: EnumRoleFilter<"SuperAdmin"> | $Enums.Role
    basicComplete?: BoolFilter<"SuperAdmin"> | boolean
    addressComplete?: BoolFilter<"SuperAdmin"> | boolean
  }, "id" | "email">

  export type SuperAdminOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    contact?: SortOrderInput | SortOrder
    position?: SortOrder
    country?: SortOrderInput | SortOrder
    state?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    zipCode?: SortOrderInput | SortOrder
    fullAddress?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    currentSessionToken?: SortOrderInput | SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    role?: SortOrder
    basicComplete?: SortOrder
    addressComplete?: SortOrder
    _count?: SuperAdminCountOrderByAggregateInput
    _max?: SuperAdminMaxOrderByAggregateInput
    _min?: SuperAdminMinOrderByAggregateInput
  }

  export type SuperAdminScalarWhereWithAggregatesInput = {
    AND?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    OR?: SuperAdminScalarWhereWithAggregatesInput[]
    NOT?: SuperAdminScalarWhereWithAggregatesInput | SuperAdminScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SuperAdmin"> | string
    name?: StringWithAggregatesFilter<"SuperAdmin"> | string
    email?: StringWithAggregatesFilter<"SuperAdmin"> | string
    password?: StringWithAggregatesFilter<"SuperAdmin"> | string
    contact?: StringNullableWithAggregatesFilter<"SuperAdmin"> | string | null
    position?: StringWithAggregatesFilter<"SuperAdmin"> | string
    country?: StringNullableWithAggregatesFilter<"SuperAdmin"> | string | null
    state?: StringNullableWithAggregatesFilter<"SuperAdmin"> | string | null
    city?: StringNullableWithAggregatesFilter<"SuperAdmin"> | string | null
    zipCode?: StringNullableWithAggregatesFilter<"SuperAdmin"> | string | null
    fullAddress?: StringNullableWithAggregatesFilter<"SuperAdmin"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SuperAdmin"> | Date | string
    currentSessionToken?: StringNullableWithAggregatesFilter<"SuperAdmin"> | string | null
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"SuperAdmin"> | Date | string | null
    role?: EnumRoleWithAggregatesFilter<"SuperAdmin"> | $Enums.Role
    basicComplete?: BoolWithAggregatesFilter<"SuperAdmin"> | boolean
    addressComplete?: BoolWithAggregatesFilter<"SuperAdmin"> | boolean
  }

  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    contact?: StringFilter<"Tenant"> | string
    fullAddress?: StringFilter<"Tenant"> | string
    logo?: StringNullableFilter<"Tenant"> | string | null
    certificateName?: StringNullableFilter<"Tenant"> | string | null
    stamp?: StringNullableFilter<"Tenant"> | string | null
    sign?: StringNullableFilter<"Tenant"> | string | null
    position?: StringFilter<"Tenant"> | string
    country?: StringFilter<"Tenant"> | string
    state?: StringFilter<"Tenant"> | string
    city?: StringFilter<"Tenant"> | string
    zipCode?: StringFilter<"Tenant"> | string
    instituteName?: StringFilter<"Tenant"> | string
    tenantId?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    email?: StringNullableFilter<"Tenant"> | string | null
    businessEmail?: StringNullableFilter<"Tenant"> | string | null
    password?: StringNullableFilter<"Tenant"> | string | null
    encryptedPassword?: StringFilter<"Tenant"> | string
    dbUrl?: StringFilter<"Tenant"> | string
    parentTenantId?: StringNullableFilter<"Tenant"> | string | null
    loginCode?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    fullAddress?: SortOrder
    logo?: SortOrderInput | SortOrder
    certificateName?: SortOrderInput | SortOrder
    stamp?: SortOrderInput | SortOrder
    sign?: SortOrderInput | SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    instituteName?: SortOrder
    tenantId?: SortOrder
    slug?: SortOrder
    email?: SortOrderInput | SortOrder
    businessEmail?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    encryptedPassword?: SortOrder
    dbUrl?: SortOrder
    parentTenantId?: SortOrderInput | SortOrder
    loginCode?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    instituteName?: string
    tenantId?: string
    slug?: string
    email?: string
    loginCode?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    contact?: StringFilter<"Tenant"> | string
    fullAddress?: StringFilter<"Tenant"> | string
    logo?: StringNullableFilter<"Tenant"> | string | null
    certificateName?: StringNullableFilter<"Tenant"> | string | null
    stamp?: StringNullableFilter<"Tenant"> | string | null
    sign?: StringNullableFilter<"Tenant"> | string | null
    position?: StringFilter<"Tenant"> | string
    country?: StringFilter<"Tenant"> | string
    state?: StringFilter<"Tenant"> | string
    city?: StringFilter<"Tenant"> | string
    zipCode?: StringFilter<"Tenant"> | string
    businessEmail?: StringNullableFilter<"Tenant"> | string | null
    password?: StringNullableFilter<"Tenant"> | string | null
    encryptedPassword?: StringFilter<"Tenant"> | string
    dbUrl?: StringFilter<"Tenant"> | string
    parentTenantId?: StringNullableFilter<"Tenant"> | string | null
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
  }, "id" | "instituteName" | "tenantId" | "slug" | "email" | "loginCode">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    fullAddress?: SortOrder
    logo?: SortOrderInput | SortOrder
    certificateName?: SortOrderInput | SortOrder
    stamp?: SortOrderInput | SortOrder
    sign?: SortOrderInput | SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    instituteName?: SortOrder
    tenantId?: SortOrder
    slug?: SortOrder
    email?: SortOrderInput | SortOrder
    businessEmail?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    encryptedPassword?: SortOrder
    dbUrl?: SortOrder
    parentTenantId?: SortOrderInput | SortOrder
    loginCode?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    contact?: StringWithAggregatesFilter<"Tenant"> | string
    fullAddress?: StringWithAggregatesFilter<"Tenant"> | string
    logo?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    certificateName?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    stamp?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    sign?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    position?: StringWithAggregatesFilter<"Tenant"> | string
    country?: StringWithAggregatesFilter<"Tenant"> | string
    state?: StringWithAggregatesFilter<"Tenant"> | string
    city?: StringWithAggregatesFilter<"Tenant"> | string
    zipCode?: StringWithAggregatesFilter<"Tenant"> | string
    instituteName?: StringWithAggregatesFilter<"Tenant"> | string
    tenantId?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    email?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    businessEmail?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    password?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    encryptedPassword?: StringWithAggregatesFilter<"Tenant"> | string
    dbUrl?: StringWithAggregatesFilter<"Tenant"> | string
    parentTenantId?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    loginCode?: StringNullableWithAggregatesFilter<"Tenant"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type SubscriptionPlanWhereInput = {
    AND?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    OR?: SubscriptionPlanWhereInput[]
    NOT?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    id?: StringFilter<"SubscriptionPlan"> | string
    code?: StringFilter<"SubscriptionPlan"> | string
    name?: StringFilter<"SubscriptionPlan"> | string
    months?: IntFilter<"SubscriptionPlan"> | number
    price?: FloatFilter<"SubscriptionPlan"> | number
    currency?: StringFilter<"SubscriptionPlan"> | string
    active?: BoolFilter<"SubscriptionPlan"> | boolean
    updatedAt?: DateTimeFilter<"SubscriptionPlan"> | Date | string
  }

  export type SubscriptionPlanOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    months?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    active?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    OR?: SubscriptionPlanWhereInput[]
    NOT?: SubscriptionPlanWhereInput | SubscriptionPlanWhereInput[]
    name?: StringFilter<"SubscriptionPlan"> | string
    months?: IntFilter<"SubscriptionPlan"> | number
    price?: FloatFilter<"SubscriptionPlan"> | number
    currency?: StringFilter<"SubscriptionPlan"> | string
    active?: BoolFilter<"SubscriptionPlan"> | boolean
    updatedAt?: DateTimeFilter<"SubscriptionPlan"> | Date | string
  }, "id" | "code">

  export type SubscriptionPlanOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    months?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    active?: SortOrder
    updatedAt?: SortOrder
    _count?: SubscriptionPlanCountOrderByAggregateInput
    _avg?: SubscriptionPlanAvgOrderByAggregateInput
    _max?: SubscriptionPlanMaxOrderByAggregateInput
    _min?: SubscriptionPlanMinOrderByAggregateInput
    _sum?: SubscriptionPlanSumOrderByAggregateInput
  }

  export type SubscriptionPlanScalarWhereWithAggregatesInput = {
    AND?: SubscriptionPlanScalarWhereWithAggregatesInput | SubscriptionPlanScalarWhereWithAggregatesInput[]
    OR?: SubscriptionPlanScalarWhereWithAggregatesInput[]
    NOT?: SubscriptionPlanScalarWhereWithAggregatesInput | SubscriptionPlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    code?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    name?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    months?: IntWithAggregatesFilter<"SubscriptionPlan"> | number
    price?: FloatWithAggregatesFilter<"SubscriptionPlan"> | number
    currency?: StringWithAggregatesFilter<"SubscriptionPlan"> | string
    active?: BoolWithAggregatesFilter<"SubscriptionPlan"> | boolean
    updatedAt?: DateTimeWithAggregatesFilter<"SubscriptionPlan"> | Date | string
  }

  export type PortalSubscriptionWhereInput = {
    AND?: PortalSubscriptionWhereInput | PortalSubscriptionWhereInput[]
    OR?: PortalSubscriptionWhereInput[]
    NOT?: PortalSubscriptionWhereInput | PortalSubscriptionWhereInput[]
    id?: StringFilter<"PortalSubscription"> | string
    email?: StringFilter<"PortalSubscription"> | string
    clientId?: StringFilter<"PortalSubscription"> | string
    plan?: StringFilter<"PortalSubscription"> | string
    startDate?: DateTimeFilter<"PortalSubscription"> | Date | string
    expiryDate?: DateTimeFilter<"PortalSubscription"> | Date | string
    status?: StringFilter<"PortalSubscription"> | string
    syncTokenHash?: StringNullableFilter<"PortalSubscription"> | string | null
    maxUsers?: IntFilter<"PortalSubscription"> | number
    updatedAt?: DateTimeFilter<"PortalSubscription"> | Date | string
  }

  export type PortalSubscriptionOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    clientId?: SortOrder
    plan?: SortOrder
    startDate?: SortOrder
    expiryDate?: SortOrder
    status?: SortOrder
    syncTokenHash?: SortOrderInput | SortOrder
    maxUsers?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalSubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: PortalSubscriptionWhereInput | PortalSubscriptionWhereInput[]
    OR?: PortalSubscriptionWhereInput[]
    NOT?: PortalSubscriptionWhereInput | PortalSubscriptionWhereInput[]
    clientId?: StringFilter<"PortalSubscription"> | string
    plan?: StringFilter<"PortalSubscription"> | string
    startDate?: DateTimeFilter<"PortalSubscription"> | Date | string
    expiryDate?: DateTimeFilter<"PortalSubscription"> | Date | string
    status?: StringFilter<"PortalSubscription"> | string
    syncTokenHash?: StringNullableFilter<"PortalSubscription"> | string | null
    maxUsers?: IntFilter<"PortalSubscription"> | number
    updatedAt?: DateTimeFilter<"PortalSubscription"> | Date | string
  }, "id" | "email">

  export type PortalSubscriptionOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    clientId?: SortOrder
    plan?: SortOrder
    startDate?: SortOrder
    expiryDate?: SortOrder
    status?: SortOrder
    syncTokenHash?: SortOrderInput | SortOrder
    maxUsers?: SortOrder
    updatedAt?: SortOrder
    _count?: PortalSubscriptionCountOrderByAggregateInput
    _avg?: PortalSubscriptionAvgOrderByAggregateInput
    _max?: PortalSubscriptionMaxOrderByAggregateInput
    _min?: PortalSubscriptionMinOrderByAggregateInput
    _sum?: PortalSubscriptionSumOrderByAggregateInput
  }

  export type PortalSubscriptionScalarWhereWithAggregatesInput = {
    AND?: PortalSubscriptionScalarWhereWithAggregatesInput | PortalSubscriptionScalarWhereWithAggregatesInput[]
    OR?: PortalSubscriptionScalarWhereWithAggregatesInput[]
    NOT?: PortalSubscriptionScalarWhereWithAggregatesInput | PortalSubscriptionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PortalSubscription"> | string
    email?: StringWithAggregatesFilter<"PortalSubscription"> | string
    clientId?: StringWithAggregatesFilter<"PortalSubscription"> | string
    plan?: StringWithAggregatesFilter<"PortalSubscription"> | string
    startDate?: DateTimeWithAggregatesFilter<"PortalSubscription"> | Date | string
    expiryDate?: DateTimeWithAggregatesFilter<"PortalSubscription"> | Date | string
    status?: StringWithAggregatesFilter<"PortalSubscription"> | string
    syncTokenHash?: StringNullableWithAggregatesFilter<"PortalSubscription"> | string | null
    maxUsers?: IntWithAggregatesFilter<"PortalSubscription"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"PortalSubscription"> | Date | string
  }

  export type PortalPaymentWhereInput = {
    AND?: PortalPaymentWhereInput | PortalPaymentWhereInput[]
    OR?: PortalPaymentWhereInput[]
    NOT?: PortalPaymentWhereInput | PortalPaymentWhereInput[]
    id?: StringFilter<"PortalPayment"> | string
    email?: StringFilter<"PortalPayment"> | string
    planCode?: StringFilter<"PortalPayment"> | string
    amount?: FloatFilter<"PortalPayment"> | number
    currency?: StringFilter<"PortalPayment"> | string
    maxUsers?: IntFilter<"PortalPayment"> | number
    orderId?: StringFilter<"PortalPayment"> | string
    paymentId?: StringNullableFilter<"PortalPayment"> | string | null
    status?: StringFilter<"PortalPayment"> | string
    createdAt?: DateTimeFilter<"PortalPayment"> | Date | string
  }

  export type PortalPaymentOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    planCode?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    maxUsers?: SortOrder
    orderId?: SortOrder
    paymentId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type PortalPaymentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    orderId?: string
    paymentId?: string
    AND?: PortalPaymentWhereInput | PortalPaymentWhereInput[]
    OR?: PortalPaymentWhereInput[]
    NOT?: PortalPaymentWhereInput | PortalPaymentWhereInput[]
    email?: StringFilter<"PortalPayment"> | string
    planCode?: StringFilter<"PortalPayment"> | string
    amount?: FloatFilter<"PortalPayment"> | number
    currency?: StringFilter<"PortalPayment"> | string
    maxUsers?: IntFilter<"PortalPayment"> | number
    status?: StringFilter<"PortalPayment"> | string
    createdAt?: DateTimeFilter<"PortalPayment"> | Date | string
  }, "id" | "orderId" | "paymentId">

  export type PortalPaymentOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    planCode?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    maxUsers?: SortOrder
    orderId?: SortOrder
    paymentId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: PortalPaymentCountOrderByAggregateInput
    _avg?: PortalPaymentAvgOrderByAggregateInput
    _max?: PortalPaymentMaxOrderByAggregateInput
    _min?: PortalPaymentMinOrderByAggregateInput
    _sum?: PortalPaymentSumOrderByAggregateInput
  }

  export type PortalPaymentScalarWhereWithAggregatesInput = {
    AND?: PortalPaymentScalarWhereWithAggregatesInput | PortalPaymentScalarWhereWithAggregatesInput[]
    OR?: PortalPaymentScalarWhereWithAggregatesInput[]
    NOT?: PortalPaymentScalarWhereWithAggregatesInput | PortalPaymentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PortalPayment"> | string
    email?: StringWithAggregatesFilter<"PortalPayment"> | string
    planCode?: StringWithAggregatesFilter<"PortalPayment"> | string
    amount?: FloatWithAggregatesFilter<"PortalPayment"> | number
    currency?: StringWithAggregatesFilter<"PortalPayment"> | string
    maxUsers?: IntWithAggregatesFilter<"PortalPayment"> | number
    orderId?: StringWithAggregatesFilter<"PortalPayment"> | string
    paymentId?: StringNullableWithAggregatesFilter<"PortalPayment"> | string | null
    status?: StringWithAggregatesFilter<"PortalPayment"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PortalPayment"> | Date | string
  }

  export type SaasAdminWhereInput = {
    AND?: SaasAdminWhereInput | SaasAdminWhereInput[]
    OR?: SaasAdminWhereInput[]
    NOT?: SaasAdminWhereInput | SaasAdminWhereInput[]
    id?: StringFilter<"SaasAdmin"> | string
    name?: StringFilter<"SaasAdmin"> | string
    email?: StringFilter<"SaasAdmin"> | string
    password?: StringFilter<"SaasAdmin"> | string
    createdAt?: DateTimeFilter<"SaasAdmin"> | Date | string
  }

  export type SaasAdminOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type SaasAdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: SaasAdminWhereInput | SaasAdminWhereInput[]
    OR?: SaasAdminWhereInput[]
    NOT?: SaasAdminWhereInput | SaasAdminWhereInput[]
    name?: StringFilter<"SaasAdmin"> | string
    password?: StringFilter<"SaasAdmin"> | string
    createdAt?: DateTimeFilter<"SaasAdmin"> | Date | string
  }, "id" | "email">

  export type SaasAdminOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    _count?: SaasAdminCountOrderByAggregateInput
    _max?: SaasAdminMaxOrderByAggregateInput
    _min?: SaasAdminMinOrderByAggregateInput
  }

  export type SaasAdminScalarWhereWithAggregatesInput = {
    AND?: SaasAdminScalarWhereWithAggregatesInput | SaasAdminScalarWhereWithAggregatesInput[]
    OR?: SaasAdminScalarWhereWithAggregatesInput[]
    NOT?: SaasAdminScalarWhereWithAggregatesInput | SaasAdminScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SaasAdmin"> | string
    name?: StringWithAggregatesFilter<"SaasAdmin"> | string
    email?: StringWithAggregatesFilter<"SaasAdmin"> | string
    password?: StringWithAggregatesFilter<"SaasAdmin"> | string
    createdAt?: DateTimeWithAggregatesFilter<"SaasAdmin"> | Date | string
  }

  export type AppSettingWhereInput = {
    AND?: AppSettingWhereInput | AppSettingWhereInput[]
    OR?: AppSettingWhereInput[]
    NOT?: AppSettingWhereInput | AppSettingWhereInput[]
    key?: StringFilter<"AppSetting"> | string
    value?: StringFilter<"AppSetting"> | string
    updatedAt?: DateTimeFilter<"AppSetting"> | Date | string
  }

  export type AppSettingOrderByWithRelationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingWhereUniqueInput = Prisma.AtLeast<{
    key?: string
    AND?: AppSettingWhereInput | AppSettingWhereInput[]
    OR?: AppSettingWhereInput[]
    NOT?: AppSettingWhereInput | AppSettingWhereInput[]
    value?: StringFilter<"AppSetting"> | string
    updatedAt?: DateTimeFilter<"AppSetting"> | Date | string
  }, "key">

  export type AppSettingOrderByWithAggregationInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
    _count?: AppSettingCountOrderByAggregateInput
    _max?: AppSettingMaxOrderByAggregateInput
    _min?: AppSettingMinOrderByAggregateInput
  }

  export type AppSettingScalarWhereWithAggregatesInput = {
    AND?: AppSettingScalarWhereWithAggregatesInput | AppSettingScalarWhereWithAggregatesInput[]
    OR?: AppSettingScalarWhereWithAggregatesInput[]
    NOT?: AppSettingScalarWhereWithAggregatesInput | AppSettingScalarWhereWithAggregatesInput[]
    key?: StringWithAggregatesFilter<"AppSetting"> | string
    value?: StringWithAggregatesFilter<"AppSetting"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"AppSetting"> | Date | string
  }

  export type ActivationKeyWhereInput = {
    AND?: ActivationKeyWhereInput | ActivationKeyWhereInput[]
    OR?: ActivationKeyWhereInput[]
    NOT?: ActivationKeyWhereInput | ActivationKeyWhereInput[]
    id?: StringFilter<"ActivationKey"> | string
    key?: StringFilter<"ActivationKey"> | string
    tenantId?: StringFilter<"ActivationKey"> | string
    instituteName?: StringFilter<"ActivationKey"> | string
    companyName?: StringFilter<"ActivationKey"> | string
    maxActivations?: IntFilter<"ActivationKey"> | number
    transferLimit?: IntFilter<"ActivationKey"> | number
    transfersUsed?: IntFilter<"ActivationKey"> | number
    status?: StringFilter<"ActivationKey"> | string
    firstActivatedAt?: DateTimeNullableFilter<"ActivationKey"> | Date | string | null
    createdAt?: DateTimeFilter<"ActivationKey"> | Date | string
    companyId?: StringNullableFilter<"ActivationKey"> | string | null
    kind?: StringFilter<"ActivationKey"> | string
    devices?: ActivationDeviceListRelationFilter
  }

  export type ActivationKeyOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    tenantId?: SortOrder
    instituteName?: SortOrder
    companyName?: SortOrder
    maxActivations?: SortOrder
    transferLimit?: SortOrder
    transfersUsed?: SortOrder
    status?: SortOrder
    firstActivatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    companyId?: SortOrderInput | SortOrder
    kind?: SortOrder
    devices?: ActivationDeviceOrderByRelationAggregateInput
  }

  export type ActivationKeyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    key?: string
    tenantId_companyId_kind?: ActivationKeyTenantIdCompanyIdKindCompoundUniqueInput
    AND?: ActivationKeyWhereInput | ActivationKeyWhereInput[]
    OR?: ActivationKeyWhereInput[]
    NOT?: ActivationKeyWhereInput | ActivationKeyWhereInput[]
    tenantId?: StringFilter<"ActivationKey"> | string
    instituteName?: StringFilter<"ActivationKey"> | string
    companyName?: StringFilter<"ActivationKey"> | string
    maxActivations?: IntFilter<"ActivationKey"> | number
    transferLimit?: IntFilter<"ActivationKey"> | number
    transfersUsed?: IntFilter<"ActivationKey"> | number
    status?: StringFilter<"ActivationKey"> | string
    firstActivatedAt?: DateTimeNullableFilter<"ActivationKey"> | Date | string | null
    createdAt?: DateTimeFilter<"ActivationKey"> | Date | string
    companyId?: StringNullableFilter<"ActivationKey"> | string | null
    kind?: StringFilter<"ActivationKey"> | string
    devices?: ActivationDeviceListRelationFilter
  }, "id" | "key" | "tenantId_companyId_kind">

  export type ActivationKeyOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    tenantId?: SortOrder
    instituteName?: SortOrder
    companyName?: SortOrder
    maxActivations?: SortOrder
    transferLimit?: SortOrder
    transfersUsed?: SortOrder
    status?: SortOrder
    firstActivatedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    companyId?: SortOrderInput | SortOrder
    kind?: SortOrder
    _count?: ActivationKeyCountOrderByAggregateInput
    _avg?: ActivationKeyAvgOrderByAggregateInput
    _max?: ActivationKeyMaxOrderByAggregateInput
    _min?: ActivationKeyMinOrderByAggregateInput
    _sum?: ActivationKeySumOrderByAggregateInput
  }

  export type ActivationKeyScalarWhereWithAggregatesInput = {
    AND?: ActivationKeyScalarWhereWithAggregatesInput | ActivationKeyScalarWhereWithAggregatesInput[]
    OR?: ActivationKeyScalarWhereWithAggregatesInput[]
    NOT?: ActivationKeyScalarWhereWithAggregatesInput | ActivationKeyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ActivationKey"> | string
    key?: StringWithAggregatesFilter<"ActivationKey"> | string
    tenantId?: StringWithAggregatesFilter<"ActivationKey"> | string
    instituteName?: StringWithAggregatesFilter<"ActivationKey"> | string
    companyName?: StringWithAggregatesFilter<"ActivationKey"> | string
    maxActivations?: IntWithAggregatesFilter<"ActivationKey"> | number
    transferLimit?: IntWithAggregatesFilter<"ActivationKey"> | number
    transfersUsed?: IntWithAggregatesFilter<"ActivationKey"> | number
    status?: StringWithAggregatesFilter<"ActivationKey"> | string
    firstActivatedAt?: DateTimeNullableWithAggregatesFilter<"ActivationKey"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ActivationKey"> | Date | string
    companyId?: StringNullableWithAggregatesFilter<"ActivationKey"> | string | null
    kind?: StringWithAggregatesFilter<"ActivationKey"> | string
  }

  export type ActivationDeviceWhereInput = {
    AND?: ActivationDeviceWhereInput | ActivationDeviceWhereInput[]
    OR?: ActivationDeviceWhereInput[]
    NOT?: ActivationDeviceWhereInput | ActivationDeviceWhereInput[]
    id?: StringFilter<"ActivationDevice"> | string
    activationKeyId?: StringFilter<"ActivationDevice"> | string
    deviceId?: StringFilter<"ActivationDevice"> | string
    deviceName?: StringFilter<"ActivationDevice"> | string
    os?: StringFilter<"ActivationDevice"> | string
    status?: StringFilter<"ActivationDevice"> | string
    activatedAt?: DateTimeFilter<"ActivationDevice"> | Date | string
    lastVerifiedAt?: DateTimeFilter<"ActivationDevice"> | Date | string
    deactivatedAt?: DateTimeNullableFilter<"ActivationDevice"> | Date | string | null
    activationKey?: XOR<ActivationKeyScalarRelationFilter, ActivationKeyWhereInput>
  }

  export type ActivationDeviceOrderByWithRelationInput = {
    id?: SortOrder
    activationKeyId?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    lastVerifiedAt?: SortOrder
    deactivatedAt?: SortOrderInput | SortOrder
    activationKey?: ActivationKeyOrderByWithRelationInput
  }

  export type ActivationDeviceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    activationKeyId_deviceId?: ActivationDeviceActivationKeyIdDeviceIdCompoundUniqueInput
    AND?: ActivationDeviceWhereInput | ActivationDeviceWhereInput[]
    OR?: ActivationDeviceWhereInput[]
    NOT?: ActivationDeviceWhereInput | ActivationDeviceWhereInput[]
    activationKeyId?: StringFilter<"ActivationDevice"> | string
    deviceId?: StringFilter<"ActivationDevice"> | string
    deviceName?: StringFilter<"ActivationDevice"> | string
    os?: StringFilter<"ActivationDevice"> | string
    status?: StringFilter<"ActivationDevice"> | string
    activatedAt?: DateTimeFilter<"ActivationDevice"> | Date | string
    lastVerifiedAt?: DateTimeFilter<"ActivationDevice"> | Date | string
    deactivatedAt?: DateTimeNullableFilter<"ActivationDevice"> | Date | string | null
    activationKey?: XOR<ActivationKeyScalarRelationFilter, ActivationKeyWhereInput>
  }, "id" | "activationKeyId_deviceId">

  export type ActivationDeviceOrderByWithAggregationInput = {
    id?: SortOrder
    activationKeyId?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    lastVerifiedAt?: SortOrder
    deactivatedAt?: SortOrderInput | SortOrder
    _count?: ActivationDeviceCountOrderByAggregateInput
    _max?: ActivationDeviceMaxOrderByAggregateInput
    _min?: ActivationDeviceMinOrderByAggregateInput
  }

  export type ActivationDeviceScalarWhereWithAggregatesInput = {
    AND?: ActivationDeviceScalarWhereWithAggregatesInput | ActivationDeviceScalarWhereWithAggregatesInput[]
    OR?: ActivationDeviceScalarWhereWithAggregatesInput[]
    NOT?: ActivationDeviceScalarWhereWithAggregatesInput | ActivationDeviceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ActivationDevice"> | string
    activationKeyId?: StringWithAggregatesFilter<"ActivationDevice"> | string
    deviceId?: StringWithAggregatesFilter<"ActivationDevice"> | string
    deviceName?: StringWithAggregatesFilter<"ActivationDevice"> | string
    os?: StringWithAggregatesFilter<"ActivationDevice"> | string
    status?: StringWithAggregatesFilter<"ActivationDevice"> | string
    activatedAt?: DateTimeWithAggregatesFilter<"ActivationDevice"> | Date | string
    lastVerifiedAt?: DateTimeWithAggregatesFilter<"ActivationDevice"> | Date | string
    deactivatedAt?: DateTimeNullableWithAggregatesFilter<"ActivationDevice"> | Date | string | null
  }

  export type ClientDeviceWhereInput = {
    AND?: ClientDeviceWhereInput | ClientDeviceWhereInput[]
    OR?: ClientDeviceWhereInput[]
    NOT?: ClientDeviceWhereInput | ClientDeviceWhereInput[]
    id?: StringFilter<"ClientDevice"> | string
    deviceId?: StringFilter<"ClientDevice"> | string
    deviceName?: StringFilter<"ClientDevice"> | string
    os?: StringFilter<"ClientDevice"> | string
    tokenHash?: StringFilter<"ClientDevice"> | string
    status?: StringFilter<"ClientDevice"> | string
    confirmedAt?: DateTimeFilter<"ClientDevice"> | Date | string
    lastSeenAt?: DateTimeFilter<"ClientDevice"> | Date | string
    lastIp?: StringNullableFilter<"ClientDevice"> | string | null
  }

  export type ClientDeviceOrderByWithRelationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    tokenHash?: SortOrder
    status?: SortOrder
    confirmedAt?: SortOrder
    lastSeenAt?: SortOrder
    lastIp?: SortOrderInput | SortOrder
  }

  export type ClientDeviceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    deviceId?: string
    AND?: ClientDeviceWhereInput | ClientDeviceWhereInput[]
    OR?: ClientDeviceWhereInput[]
    NOT?: ClientDeviceWhereInput | ClientDeviceWhereInput[]
    deviceName?: StringFilter<"ClientDevice"> | string
    os?: StringFilter<"ClientDevice"> | string
    tokenHash?: StringFilter<"ClientDevice"> | string
    status?: StringFilter<"ClientDevice"> | string
    confirmedAt?: DateTimeFilter<"ClientDevice"> | Date | string
    lastSeenAt?: DateTimeFilter<"ClientDevice"> | Date | string
    lastIp?: StringNullableFilter<"ClientDevice"> | string | null
  }, "id" | "deviceId">

  export type ClientDeviceOrderByWithAggregationInput = {
    id?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    tokenHash?: SortOrder
    status?: SortOrder
    confirmedAt?: SortOrder
    lastSeenAt?: SortOrder
    lastIp?: SortOrderInput | SortOrder
    _count?: ClientDeviceCountOrderByAggregateInput
    _max?: ClientDeviceMaxOrderByAggregateInput
    _min?: ClientDeviceMinOrderByAggregateInput
  }

  export type ClientDeviceScalarWhereWithAggregatesInput = {
    AND?: ClientDeviceScalarWhereWithAggregatesInput | ClientDeviceScalarWhereWithAggregatesInput[]
    OR?: ClientDeviceScalarWhereWithAggregatesInput[]
    NOT?: ClientDeviceScalarWhereWithAggregatesInput | ClientDeviceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ClientDevice"> | string
    deviceId?: StringWithAggregatesFilter<"ClientDevice"> | string
    deviceName?: StringWithAggregatesFilter<"ClientDevice"> | string
    os?: StringWithAggregatesFilter<"ClientDevice"> | string
    tokenHash?: StringWithAggregatesFilter<"ClientDevice"> | string
    status?: StringWithAggregatesFilter<"ClientDevice"> | string
    confirmedAt?: DateTimeWithAggregatesFilter<"ClientDevice"> | Date | string
    lastSeenAt?: DateTimeWithAggregatesFilter<"ClientDevice"> | Date | string
    lastIp?: StringNullableWithAggregatesFilter<"ClientDevice"> | string | null
  }

  export type SuperAdminCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    contact?: string | null
    position: string
    country?: string | null
    state?: string | null
    city?: string | null
    zipCode?: string | null
    fullAddress?: string | null
    createdAt?: Date | string
    currentSessionToken?: string | null
    lastLoginAt?: Date | string | null
    role?: $Enums.Role
    basicComplete?: boolean
    addressComplete?: boolean
  }

  export type SuperAdminUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    contact?: string | null
    position: string
    country?: string | null
    state?: string | null
    city?: string | null
    zipCode?: string | null
    fullAddress?: string | null
    createdAt?: Date | string
    currentSessionToken?: string | null
    lastLoginAt?: Date | string | null
    role?: $Enums.Role
    basicComplete?: boolean
    addressComplete?: boolean
  }

  export type SuperAdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    contact?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentSessionToken?: NullableStringFieldUpdateOperationsInput | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    basicComplete?: BoolFieldUpdateOperationsInput | boolean
    addressComplete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SuperAdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    contact?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentSessionToken?: NullableStringFieldUpdateOperationsInput | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    basicComplete?: BoolFieldUpdateOperationsInput | boolean
    addressComplete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SuperAdminCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    contact?: string | null
    position: string
    country?: string | null
    state?: string | null
    city?: string | null
    zipCode?: string | null
    fullAddress?: string | null
    createdAt?: Date | string
    currentSessionToken?: string | null
    lastLoginAt?: Date | string | null
    role?: $Enums.Role
    basicComplete?: boolean
    addressComplete?: boolean
  }

  export type SuperAdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    contact?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentSessionToken?: NullableStringFieldUpdateOperationsInput | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    basicComplete?: BoolFieldUpdateOperationsInput | boolean
    addressComplete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type SuperAdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    contact?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: NullableStringFieldUpdateOperationsInput | string | null
    state?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    zipCode?: NullableStringFieldUpdateOperationsInput | string | null
    fullAddress?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    currentSessionToken?: NullableStringFieldUpdateOperationsInput | string | null
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    basicComplete?: BoolFieldUpdateOperationsInput | boolean
    addressComplete?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TenantCreateInput = {
    id?: string
    name: string
    contact: string
    fullAddress: string
    logo?: string | null
    certificateName?: string | null
    stamp?: string | null
    sign?: string | null
    position: string
    country: string
    state: string
    city: string
    zipCode: string
    instituteName: string
    tenantId: string
    slug: string
    email?: string | null
    businessEmail?: string | null
    password?: string | null
    encryptedPassword: string
    dbUrl: string
    parentTenantId?: string | null
    loginCode?: string | null
    createdAt?: Date | string
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    name: string
    contact: string
    fullAddress: string
    logo?: string | null
    certificateName?: string | null
    stamp?: string | null
    sign?: string | null
    position: string
    country: string
    state: string
    city: string
    zipCode: string
    instituteName: string
    tenantId: string
    slug: string
    email?: string | null
    businessEmail?: string | null
    password?: string | null
    encryptedPassword: string
    dbUrl: string
    parentTenantId?: string | null
    loginCode?: string | null
    createdAt?: Date | string
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    certificateName?: NullableStringFieldUpdateOperationsInput | string | null
    stamp?: NullableStringFieldUpdateOperationsInput | string | null
    sign?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    zipCode?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    businessEmail?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    parentTenantId?: NullableStringFieldUpdateOperationsInput | string | null
    loginCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    certificateName?: NullableStringFieldUpdateOperationsInput | string | null
    stamp?: NullableStringFieldUpdateOperationsInput | string | null
    sign?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    zipCode?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    businessEmail?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    parentTenantId?: NullableStringFieldUpdateOperationsInput | string | null
    loginCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateManyInput = {
    id?: string
    name: string
    contact: string
    fullAddress: string
    logo?: string | null
    certificateName?: string | null
    stamp?: string | null
    sign?: string | null
    position: string
    country: string
    state: string
    city: string
    zipCode: string
    instituteName: string
    tenantId: string
    slug: string
    email?: string | null
    businessEmail?: string | null
    password?: string | null
    encryptedPassword: string
    dbUrl: string
    parentTenantId?: string | null
    loginCode?: string | null
    createdAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    certificateName?: NullableStringFieldUpdateOperationsInput | string | null
    stamp?: NullableStringFieldUpdateOperationsInput | string | null
    sign?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    zipCode?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    businessEmail?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    parentTenantId?: NullableStringFieldUpdateOperationsInput | string | null
    loginCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    fullAddress?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    certificateName?: NullableStringFieldUpdateOperationsInput | string | null
    stamp?: NullableStringFieldUpdateOperationsInput | string | null
    sign?: NullableStringFieldUpdateOperationsInput | string | null
    position?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    city?: StringFieldUpdateOperationsInput | string
    zipCode?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    businessEmail?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    encryptedPassword?: StringFieldUpdateOperationsInput | string
    dbUrl?: StringFieldUpdateOperationsInput | string
    parentTenantId?: NullableStringFieldUpdateOperationsInput | string | null
    loginCode?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionPlanCreateInput = {
    id?: string
    code: string
    name: string
    months: number
    price: number
    currency?: string
    active?: boolean
    updatedAt?: Date | string
  }

  export type SubscriptionPlanUncheckedCreateInput = {
    id?: string
    code: string
    name: string
    months: number
    price: number
    currency?: string
    active?: boolean
    updatedAt?: Date | string
  }

  export type SubscriptionPlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    months?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionPlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    months?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionPlanCreateManyInput = {
    id?: string
    code: string
    name: string
    months: number
    price: number
    currency?: string
    active?: boolean
    updatedAt?: Date | string
  }

  export type SubscriptionPlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    months?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SubscriptionPlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    months?: IntFieldUpdateOperationsInput | number
    price?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    active?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalSubscriptionCreateInput = {
    id?: string
    email: string
    clientId: string
    plan?: string
    startDate?: Date | string
    expiryDate?: Date | string
    status?: string
    syncTokenHash?: string | null
    maxUsers?: number
    updatedAt?: Date | string
  }

  export type PortalSubscriptionUncheckedCreateInput = {
    id?: string
    email: string
    clientId: string
    plan?: string
    startDate?: Date | string
    expiryDate?: Date | string
    status?: string
    syncTokenHash?: string | null
    maxUsers?: number
    updatedAt?: Date | string
  }

  export type PortalSubscriptionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    expiryDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    syncTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalSubscriptionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    expiryDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    syncTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalSubscriptionCreateManyInput = {
    id?: string
    email: string
    clientId: string
    plan?: string
    startDate?: Date | string
    expiryDate?: Date | string
    status?: string
    syncTokenHash?: string | null
    maxUsers?: number
    updatedAt?: Date | string
  }

  export type PortalSubscriptionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    expiryDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    syncTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalSubscriptionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    expiryDate?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    syncTokenHash?: NullableStringFieldUpdateOperationsInput | string | null
    maxUsers?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalPaymentCreateInput = {
    id?: string
    email: string
    planCode: string
    amount: number
    currency?: string
    maxUsers?: number
    orderId: string
    paymentId?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type PortalPaymentUncheckedCreateInput = {
    id?: string
    email: string
    planCode: string
    amount: number
    currency?: string
    maxUsers?: number
    orderId: string
    paymentId?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type PortalPaymentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    maxUsers?: IntFieldUpdateOperationsInput | number
    orderId?: StringFieldUpdateOperationsInput | string
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalPaymentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    maxUsers?: IntFieldUpdateOperationsInput | number
    orderId?: StringFieldUpdateOperationsInput | string
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalPaymentCreateManyInput = {
    id?: string
    email: string
    planCode: string
    amount: number
    currency?: string
    maxUsers?: number
    orderId: string
    paymentId?: string | null
    status?: string
    createdAt?: Date | string
  }

  export type PortalPaymentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    maxUsers?: IntFieldUpdateOperationsInput | number
    orderId?: StringFieldUpdateOperationsInput | string
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PortalPaymentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    planCode?: StringFieldUpdateOperationsInput | string
    amount?: FloatFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    maxUsers?: IntFieldUpdateOperationsInput | number
    orderId?: StringFieldUpdateOperationsInput | string
    paymentId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaasAdminCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
  }

  export type SaasAdminUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
  }

  export type SaasAdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaasAdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaasAdminCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    createdAt?: Date | string
  }

  export type SaasAdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaasAdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type AppSettingUncheckedCreateInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type AppSettingUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingUncheckedUpdateInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingCreateManyInput = {
    key: string
    value: string
    updatedAt?: Date | string
  }

  export type AppSettingUpdateManyMutationInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppSettingUncheckedUpdateManyInput = {
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivationKeyCreateInput = {
    id?: string
    key: string
    tenantId: string
    instituteName: string
    companyName: string
    maxActivations?: number
    transferLimit?: number
    transfersUsed?: number
    status?: string
    firstActivatedAt?: Date | string | null
    createdAt?: Date | string
    companyId?: string | null
    kind?: string
    devices?: ActivationDeviceCreateNestedManyWithoutActivationKeyInput
  }

  export type ActivationKeyUncheckedCreateInput = {
    id?: string
    key: string
    tenantId: string
    instituteName: string
    companyName: string
    maxActivations?: number
    transferLimit?: number
    transfersUsed?: number
    status?: string
    firstActivatedAt?: Date | string | null
    createdAt?: Date | string
    companyId?: string | null
    kind?: string
    devices?: ActivationDeviceUncheckedCreateNestedManyWithoutActivationKeyInput
  }

  export type ActivationKeyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    maxActivations?: IntFieldUpdateOperationsInput | number
    transferLimit?: IntFieldUpdateOperationsInput | number
    transfersUsed?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    firstActivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    devices?: ActivationDeviceUpdateManyWithoutActivationKeyNestedInput
  }

  export type ActivationKeyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    maxActivations?: IntFieldUpdateOperationsInput | number
    transferLimit?: IntFieldUpdateOperationsInput | number
    transfersUsed?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    firstActivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
    devices?: ActivationDeviceUncheckedUpdateManyWithoutActivationKeyNestedInput
  }

  export type ActivationKeyCreateManyInput = {
    id?: string
    key: string
    tenantId: string
    instituteName: string
    companyName: string
    maxActivations?: number
    transferLimit?: number
    transfersUsed?: number
    status?: string
    firstActivatedAt?: Date | string | null
    createdAt?: Date | string
    companyId?: string | null
    kind?: string
  }

  export type ActivationKeyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    maxActivations?: IntFieldUpdateOperationsInput | number
    transferLimit?: IntFieldUpdateOperationsInput | number
    transfersUsed?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    firstActivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
  }

  export type ActivationKeyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    maxActivations?: IntFieldUpdateOperationsInput | number
    transferLimit?: IntFieldUpdateOperationsInput | number
    transfersUsed?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    firstActivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
  }

  export type ActivationDeviceCreateInput = {
    id?: string
    deviceId: string
    deviceName: string
    os?: string
    status?: string
    activatedAt?: Date | string
    lastVerifiedAt?: Date | string
    deactivatedAt?: Date | string | null
    activationKey: ActivationKeyCreateNestedOneWithoutDevicesInput
  }

  export type ActivationDeviceUncheckedCreateInput = {
    id?: string
    activationKeyId: string
    deviceId: string
    deviceName: string
    os?: string
    status?: string
    activatedAt?: Date | string
    lastVerifiedAt?: Date | string
    deactivatedAt?: Date | string | null
  }

  export type ActivationDeviceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    activatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastVerifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    activationKey?: ActivationKeyUpdateOneRequiredWithoutDevicesNestedInput
  }

  export type ActivationDeviceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationKeyId?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    activatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastVerifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivationDeviceCreateManyInput = {
    id?: string
    activationKeyId: string
    deviceId: string
    deviceName: string
    os?: string
    status?: string
    activatedAt?: Date | string
    lastVerifiedAt?: Date | string
    deactivatedAt?: Date | string | null
  }

  export type ActivationDeviceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    activatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastVerifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivationDeviceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    activationKeyId?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    activatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastVerifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ClientDeviceCreateInput = {
    id?: string
    deviceId: string
    deviceName: string
    os?: string
    tokenHash: string
    status?: string
    confirmedAt?: Date | string
    lastSeenAt?: Date | string
    lastIp?: string | null
  }

  export type ClientDeviceUncheckedCreateInput = {
    id?: string
    deviceId: string
    deviceName: string
    os?: string
    tokenHash: string
    status?: string
    confirmedAt?: Date | string
    lastSeenAt?: Date | string
    lastIp?: string | null
  }

  export type ClientDeviceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeenAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClientDeviceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeenAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClientDeviceCreateManyInput = {
    id?: string
    deviceId: string
    deviceName: string
    os?: string
    tokenHash: string
    status?: string
    confirmedAt?: Date | string
    lastSeenAt?: Date | string
    lastIp?: string | null
  }

  export type ClientDeviceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeenAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClientDeviceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    confirmedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastSeenAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastIp?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SuperAdminCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    contact?: SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    currentSessionToken?: SortOrder
    lastLoginAt?: SortOrder
    role?: SortOrder
    basicComplete?: SortOrder
    addressComplete?: SortOrder
  }

  export type SuperAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    contact?: SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    currentSessionToken?: SortOrder
    lastLoginAt?: SortOrder
    role?: SortOrder
    basicComplete?: SortOrder
    addressComplete?: SortOrder
  }

  export type SuperAdminMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    contact?: SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    fullAddress?: SortOrder
    createdAt?: SortOrder
    currentSessionToken?: SortOrder
    lastLoginAt?: SortOrder
    role?: SortOrder
    basicComplete?: SortOrder
    addressComplete?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    fullAddress?: SortOrder
    logo?: SortOrder
    certificateName?: SortOrder
    stamp?: SortOrder
    sign?: SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    instituteName?: SortOrder
    tenantId?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    businessEmail?: SortOrder
    password?: SortOrder
    encryptedPassword?: SortOrder
    dbUrl?: SortOrder
    parentTenantId?: SortOrder
    loginCode?: SortOrder
    createdAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    fullAddress?: SortOrder
    logo?: SortOrder
    certificateName?: SortOrder
    stamp?: SortOrder
    sign?: SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    instituteName?: SortOrder
    tenantId?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    businessEmail?: SortOrder
    password?: SortOrder
    encryptedPassword?: SortOrder
    dbUrl?: SortOrder
    parentTenantId?: SortOrder
    loginCode?: SortOrder
    createdAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    contact?: SortOrder
    fullAddress?: SortOrder
    logo?: SortOrder
    certificateName?: SortOrder
    stamp?: SortOrder
    sign?: SortOrder
    position?: SortOrder
    country?: SortOrder
    state?: SortOrder
    city?: SortOrder
    zipCode?: SortOrder
    instituteName?: SortOrder
    tenantId?: SortOrder
    slug?: SortOrder
    email?: SortOrder
    businessEmail?: SortOrder
    password?: SortOrder
    encryptedPassword?: SortOrder
    dbUrl?: SortOrder
    parentTenantId?: SortOrder
    loginCode?: SortOrder
    createdAt?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type SubscriptionPlanCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    months?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    active?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionPlanAvgOrderByAggregateInput = {
    months?: SortOrder
    price?: SortOrder
  }

  export type SubscriptionPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    months?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    active?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionPlanMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    months?: SortOrder
    price?: SortOrder
    currency?: SortOrder
    active?: SortOrder
    updatedAt?: SortOrder
  }

  export type SubscriptionPlanSumOrderByAggregateInput = {
    months?: SortOrder
    price?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type PortalSubscriptionCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    clientId?: SortOrder
    plan?: SortOrder
    startDate?: SortOrder
    expiryDate?: SortOrder
    status?: SortOrder
    syncTokenHash?: SortOrder
    maxUsers?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalSubscriptionAvgOrderByAggregateInput = {
    maxUsers?: SortOrder
  }

  export type PortalSubscriptionMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    clientId?: SortOrder
    plan?: SortOrder
    startDate?: SortOrder
    expiryDate?: SortOrder
    status?: SortOrder
    syncTokenHash?: SortOrder
    maxUsers?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalSubscriptionMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    clientId?: SortOrder
    plan?: SortOrder
    startDate?: SortOrder
    expiryDate?: SortOrder
    status?: SortOrder
    syncTokenHash?: SortOrder
    maxUsers?: SortOrder
    updatedAt?: SortOrder
  }

  export type PortalSubscriptionSumOrderByAggregateInput = {
    maxUsers?: SortOrder
  }

  export type PortalPaymentCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    planCode?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    maxUsers?: SortOrder
    orderId?: SortOrder
    paymentId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type PortalPaymentAvgOrderByAggregateInput = {
    amount?: SortOrder
    maxUsers?: SortOrder
  }

  export type PortalPaymentMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    planCode?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    maxUsers?: SortOrder
    orderId?: SortOrder
    paymentId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type PortalPaymentMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    planCode?: SortOrder
    amount?: SortOrder
    currency?: SortOrder
    maxUsers?: SortOrder
    orderId?: SortOrder
    paymentId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type PortalPaymentSumOrderByAggregateInput = {
    amount?: SortOrder
    maxUsers?: SortOrder
  }

  export type SaasAdminCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type SaasAdminMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type SaasAdminMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
  }

  export type AppSettingCountOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingMaxOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppSettingMinOrderByAggregateInput = {
    key?: SortOrder
    value?: SortOrder
    updatedAt?: SortOrder
  }

  export type ActivationDeviceListRelationFilter = {
    every?: ActivationDeviceWhereInput
    some?: ActivationDeviceWhereInput
    none?: ActivationDeviceWhereInput
  }

  export type ActivationDeviceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ActivationKeyTenantIdCompanyIdKindCompoundUniqueInput = {
    tenantId: string
    companyId: string
    kind: string
  }

  export type ActivationKeyCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    tenantId?: SortOrder
    instituteName?: SortOrder
    companyName?: SortOrder
    maxActivations?: SortOrder
    transferLimit?: SortOrder
    transfersUsed?: SortOrder
    status?: SortOrder
    firstActivatedAt?: SortOrder
    createdAt?: SortOrder
    companyId?: SortOrder
    kind?: SortOrder
  }

  export type ActivationKeyAvgOrderByAggregateInput = {
    maxActivations?: SortOrder
    transferLimit?: SortOrder
    transfersUsed?: SortOrder
  }

  export type ActivationKeyMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    tenantId?: SortOrder
    instituteName?: SortOrder
    companyName?: SortOrder
    maxActivations?: SortOrder
    transferLimit?: SortOrder
    transfersUsed?: SortOrder
    status?: SortOrder
    firstActivatedAt?: SortOrder
    createdAt?: SortOrder
    companyId?: SortOrder
    kind?: SortOrder
  }

  export type ActivationKeyMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    tenantId?: SortOrder
    instituteName?: SortOrder
    companyName?: SortOrder
    maxActivations?: SortOrder
    transferLimit?: SortOrder
    transfersUsed?: SortOrder
    status?: SortOrder
    firstActivatedAt?: SortOrder
    createdAt?: SortOrder
    companyId?: SortOrder
    kind?: SortOrder
  }

  export type ActivationKeySumOrderByAggregateInput = {
    maxActivations?: SortOrder
    transferLimit?: SortOrder
    transfersUsed?: SortOrder
  }

  export type ActivationKeyScalarRelationFilter = {
    is?: ActivationKeyWhereInput
    isNot?: ActivationKeyWhereInput
  }

  export type ActivationDeviceActivationKeyIdDeviceIdCompoundUniqueInput = {
    activationKeyId: string
    deviceId: string
  }

  export type ActivationDeviceCountOrderByAggregateInput = {
    id?: SortOrder
    activationKeyId?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    lastVerifiedAt?: SortOrder
    deactivatedAt?: SortOrder
  }

  export type ActivationDeviceMaxOrderByAggregateInput = {
    id?: SortOrder
    activationKeyId?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    lastVerifiedAt?: SortOrder
    deactivatedAt?: SortOrder
  }

  export type ActivationDeviceMinOrderByAggregateInput = {
    id?: SortOrder
    activationKeyId?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    status?: SortOrder
    activatedAt?: SortOrder
    lastVerifiedAt?: SortOrder
    deactivatedAt?: SortOrder
  }

  export type ClientDeviceCountOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    tokenHash?: SortOrder
    status?: SortOrder
    confirmedAt?: SortOrder
    lastSeenAt?: SortOrder
    lastIp?: SortOrder
  }

  export type ClientDeviceMaxOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    tokenHash?: SortOrder
    status?: SortOrder
    confirmedAt?: SortOrder
    lastSeenAt?: SortOrder
    lastIp?: SortOrder
  }

  export type ClientDeviceMinOrderByAggregateInput = {
    id?: SortOrder
    deviceId?: SortOrder
    deviceName?: SortOrder
    os?: SortOrder
    tokenHash?: SortOrder
    status?: SortOrder
    confirmedAt?: SortOrder
    lastSeenAt?: SortOrder
    lastIp?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ActivationDeviceCreateNestedManyWithoutActivationKeyInput = {
    create?: XOR<ActivationDeviceCreateWithoutActivationKeyInput, ActivationDeviceUncheckedCreateWithoutActivationKeyInput> | ActivationDeviceCreateWithoutActivationKeyInput[] | ActivationDeviceUncheckedCreateWithoutActivationKeyInput[]
    connectOrCreate?: ActivationDeviceCreateOrConnectWithoutActivationKeyInput | ActivationDeviceCreateOrConnectWithoutActivationKeyInput[]
    createMany?: ActivationDeviceCreateManyActivationKeyInputEnvelope
    connect?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
  }

  export type ActivationDeviceUncheckedCreateNestedManyWithoutActivationKeyInput = {
    create?: XOR<ActivationDeviceCreateWithoutActivationKeyInput, ActivationDeviceUncheckedCreateWithoutActivationKeyInput> | ActivationDeviceCreateWithoutActivationKeyInput[] | ActivationDeviceUncheckedCreateWithoutActivationKeyInput[]
    connectOrCreate?: ActivationDeviceCreateOrConnectWithoutActivationKeyInput | ActivationDeviceCreateOrConnectWithoutActivationKeyInput[]
    createMany?: ActivationDeviceCreateManyActivationKeyInputEnvelope
    connect?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
  }

  export type ActivationDeviceUpdateManyWithoutActivationKeyNestedInput = {
    create?: XOR<ActivationDeviceCreateWithoutActivationKeyInput, ActivationDeviceUncheckedCreateWithoutActivationKeyInput> | ActivationDeviceCreateWithoutActivationKeyInput[] | ActivationDeviceUncheckedCreateWithoutActivationKeyInput[]
    connectOrCreate?: ActivationDeviceCreateOrConnectWithoutActivationKeyInput | ActivationDeviceCreateOrConnectWithoutActivationKeyInput[]
    upsert?: ActivationDeviceUpsertWithWhereUniqueWithoutActivationKeyInput | ActivationDeviceUpsertWithWhereUniqueWithoutActivationKeyInput[]
    createMany?: ActivationDeviceCreateManyActivationKeyInputEnvelope
    set?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    disconnect?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    delete?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    connect?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    update?: ActivationDeviceUpdateWithWhereUniqueWithoutActivationKeyInput | ActivationDeviceUpdateWithWhereUniqueWithoutActivationKeyInput[]
    updateMany?: ActivationDeviceUpdateManyWithWhereWithoutActivationKeyInput | ActivationDeviceUpdateManyWithWhereWithoutActivationKeyInput[]
    deleteMany?: ActivationDeviceScalarWhereInput | ActivationDeviceScalarWhereInput[]
  }

  export type ActivationDeviceUncheckedUpdateManyWithoutActivationKeyNestedInput = {
    create?: XOR<ActivationDeviceCreateWithoutActivationKeyInput, ActivationDeviceUncheckedCreateWithoutActivationKeyInput> | ActivationDeviceCreateWithoutActivationKeyInput[] | ActivationDeviceUncheckedCreateWithoutActivationKeyInput[]
    connectOrCreate?: ActivationDeviceCreateOrConnectWithoutActivationKeyInput | ActivationDeviceCreateOrConnectWithoutActivationKeyInput[]
    upsert?: ActivationDeviceUpsertWithWhereUniqueWithoutActivationKeyInput | ActivationDeviceUpsertWithWhereUniqueWithoutActivationKeyInput[]
    createMany?: ActivationDeviceCreateManyActivationKeyInputEnvelope
    set?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    disconnect?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    delete?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    connect?: ActivationDeviceWhereUniqueInput | ActivationDeviceWhereUniqueInput[]
    update?: ActivationDeviceUpdateWithWhereUniqueWithoutActivationKeyInput | ActivationDeviceUpdateWithWhereUniqueWithoutActivationKeyInput[]
    updateMany?: ActivationDeviceUpdateManyWithWhereWithoutActivationKeyInput | ActivationDeviceUpdateManyWithWhereWithoutActivationKeyInput[]
    deleteMany?: ActivationDeviceScalarWhereInput | ActivationDeviceScalarWhereInput[]
  }

  export type ActivationKeyCreateNestedOneWithoutDevicesInput = {
    create?: XOR<ActivationKeyCreateWithoutDevicesInput, ActivationKeyUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: ActivationKeyCreateOrConnectWithoutDevicesInput
    connect?: ActivationKeyWhereUniqueInput
  }

  export type ActivationKeyUpdateOneRequiredWithoutDevicesNestedInput = {
    create?: XOR<ActivationKeyCreateWithoutDevicesInput, ActivationKeyUncheckedCreateWithoutDevicesInput>
    connectOrCreate?: ActivationKeyCreateOrConnectWithoutDevicesInput
    upsert?: ActivationKeyUpsertWithoutDevicesInput
    connect?: ActivationKeyWhereUniqueInput
    update?: XOR<XOR<ActivationKeyUpdateToOneWithWhereWithoutDevicesInput, ActivationKeyUpdateWithoutDevicesInput>, ActivationKeyUncheckedUpdateWithoutDevicesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type ActivationDeviceCreateWithoutActivationKeyInput = {
    id?: string
    deviceId: string
    deviceName: string
    os?: string
    status?: string
    activatedAt?: Date | string
    lastVerifiedAt?: Date | string
    deactivatedAt?: Date | string | null
  }

  export type ActivationDeviceUncheckedCreateWithoutActivationKeyInput = {
    id?: string
    deviceId: string
    deviceName: string
    os?: string
    status?: string
    activatedAt?: Date | string
    lastVerifiedAt?: Date | string
    deactivatedAt?: Date | string | null
  }

  export type ActivationDeviceCreateOrConnectWithoutActivationKeyInput = {
    where: ActivationDeviceWhereUniqueInput
    create: XOR<ActivationDeviceCreateWithoutActivationKeyInput, ActivationDeviceUncheckedCreateWithoutActivationKeyInput>
  }

  export type ActivationDeviceCreateManyActivationKeyInputEnvelope = {
    data: ActivationDeviceCreateManyActivationKeyInput | ActivationDeviceCreateManyActivationKeyInput[]
  }

  export type ActivationDeviceUpsertWithWhereUniqueWithoutActivationKeyInput = {
    where: ActivationDeviceWhereUniqueInput
    update: XOR<ActivationDeviceUpdateWithoutActivationKeyInput, ActivationDeviceUncheckedUpdateWithoutActivationKeyInput>
    create: XOR<ActivationDeviceCreateWithoutActivationKeyInput, ActivationDeviceUncheckedCreateWithoutActivationKeyInput>
  }

  export type ActivationDeviceUpdateWithWhereUniqueWithoutActivationKeyInput = {
    where: ActivationDeviceWhereUniqueInput
    data: XOR<ActivationDeviceUpdateWithoutActivationKeyInput, ActivationDeviceUncheckedUpdateWithoutActivationKeyInput>
  }

  export type ActivationDeviceUpdateManyWithWhereWithoutActivationKeyInput = {
    where: ActivationDeviceScalarWhereInput
    data: XOR<ActivationDeviceUpdateManyMutationInput, ActivationDeviceUncheckedUpdateManyWithoutActivationKeyInput>
  }

  export type ActivationDeviceScalarWhereInput = {
    AND?: ActivationDeviceScalarWhereInput | ActivationDeviceScalarWhereInput[]
    OR?: ActivationDeviceScalarWhereInput[]
    NOT?: ActivationDeviceScalarWhereInput | ActivationDeviceScalarWhereInput[]
    id?: StringFilter<"ActivationDevice"> | string
    activationKeyId?: StringFilter<"ActivationDevice"> | string
    deviceId?: StringFilter<"ActivationDevice"> | string
    deviceName?: StringFilter<"ActivationDevice"> | string
    os?: StringFilter<"ActivationDevice"> | string
    status?: StringFilter<"ActivationDevice"> | string
    activatedAt?: DateTimeFilter<"ActivationDevice"> | Date | string
    lastVerifiedAt?: DateTimeFilter<"ActivationDevice"> | Date | string
    deactivatedAt?: DateTimeNullableFilter<"ActivationDevice"> | Date | string | null
  }

  export type ActivationKeyCreateWithoutDevicesInput = {
    id?: string
    key: string
    tenantId: string
    instituteName: string
    companyName: string
    maxActivations?: number
    transferLimit?: number
    transfersUsed?: number
    status?: string
    firstActivatedAt?: Date | string | null
    createdAt?: Date | string
    companyId?: string | null
    kind?: string
  }

  export type ActivationKeyUncheckedCreateWithoutDevicesInput = {
    id?: string
    key: string
    tenantId: string
    instituteName: string
    companyName: string
    maxActivations?: number
    transferLimit?: number
    transfersUsed?: number
    status?: string
    firstActivatedAt?: Date | string | null
    createdAt?: Date | string
    companyId?: string | null
    kind?: string
  }

  export type ActivationKeyCreateOrConnectWithoutDevicesInput = {
    where: ActivationKeyWhereUniqueInput
    create: XOR<ActivationKeyCreateWithoutDevicesInput, ActivationKeyUncheckedCreateWithoutDevicesInput>
  }

  export type ActivationKeyUpsertWithoutDevicesInput = {
    update: XOR<ActivationKeyUpdateWithoutDevicesInput, ActivationKeyUncheckedUpdateWithoutDevicesInput>
    create: XOR<ActivationKeyCreateWithoutDevicesInput, ActivationKeyUncheckedCreateWithoutDevicesInput>
    where?: ActivationKeyWhereInput
  }

  export type ActivationKeyUpdateToOneWithWhereWithoutDevicesInput = {
    where?: ActivationKeyWhereInput
    data: XOR<ActivationKeyUpdateWithoutDevicesInput, ActivationKeyUncheckedUpdateWithoutDevicesInput>
  }

  export type ActivationKeyUpdateWithoutDevicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    maxActivations?: IntFieldUpdateOperationsInput | number
    transferLimit?: IntFieldUpdateOperationsInput | number
    transfersUsed?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    firstActivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
  }

  export type ActivationKeyUncheckedUpdateWithoutDevicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    instituteName?: StringFieldUpdateOperationsInput | string
    companyName?: StringFieldUpdateOperationsInput | string
    maxActivations?: IntFieldUpdateOperationsInput | number
    transferLimit?: IntFieldUpdateOperationsInput | number
    transfersUsed?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    firstActivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    companyId?: NullableStringFieldUpdateOperationsInput | string | null
    kind?: StringFieldUpdateOperationsInput | string
  }

  export type ActivationDeviceCreateManyActivationKeyInput = {
    id?: string
    deviceId: string
    deviceName: string
    os?: string
    status?: string
    activatedAt?: Date | string
    lastVerifiedAt?: Date | string
    deactivatedAt?: Date | string | null
  }

  export type ActivationDeviceUpdateWithoutActivationKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    activatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastVerifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivationDeviceUncheckedUpdateWithoutActivationKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    activatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastVerifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ActivationDeviceUncheckedUpdateManyWithoutActivationKeyInput = {
    id?: StringFieldUpdateOperationsInput | string
    deviceId?: StringFieldUpdateOperationsInput | string
    deviceName?: StringFieldUpdateOperationsInput | string
    os?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    activatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastVerifiedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    deactivatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}