import { betterAuth } from 'better-auth';
import t from 'better-sqlite3';

const o = betterAuth({ database: new t("./auth.db"), emailAndPassword: { enabled: true } });

export { o };
//# sourceMappingURL=auth-BxWnXXi5.mjs.map
