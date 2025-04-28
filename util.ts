import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js";

type response = {
  ok: boolean;
  message: string;
};

export class database {
  private db: PGlite;
  name: string;

  constructor(name: string = null) {
    if (name === undefined || name === null) this.db = new PGlite();
    else this.db = new PGlite(`idb://${name}`);
    this.init();
  }
  get = () => this.db;

  init = async () => {
    const check_table_exists = await this.db.query(`
      SELECT * FROM pg_tables WHERE tablename = 'todos';
    `);

    if (check_table_exists.rows.length === 0) {
      const res = await this.get().exec(`
        CREATE TABLE IF NOT EXISTS todos (id serial PRIMARY KEY, task text, done BOOLEAN DEFAULT false);
        INSERT INTO todos 
            (task, done) 
        VALUES 
            ('Learn PostgreSQL', true),
            ('Learn TypeScript', false),
            ('Learn TailwindCSS', false);
    `);
    }
  };

  add_todo = async (task: string, db: PGlite): Promise<response> => {
    if (task.length === 0)
      return { ok: false, message: "Task cannot be empty" };

    try {
      const res = await this.get().exec(
        `INSERT INTO todos (task) VALUES ('${task}');`,
      );

      const { rows } = await this.get().query(`SELECT lastval() as id;`);
      return {
        ok: true,
        message: "Task added",
        id: rows[0].id,
      };
    } catch (e) {
      return {
        ok: false,
        message: e.message,
      };
    }
  };

  toggle_todo = async (id: number, done: boolean) => {
    try {
      const res = await this.get().exec(
        `UPDATE todos SET done = ${done} WHERE id = ${id};`,
      );
    } catch (e) {
      return {
        ok: false,
        message: e.message,
      };
    }
    return {
      ok: true,
      message: `Task ${id} toggle`,
    };
  };

  delete_todo = async (id: number): Promise<promise> => {
    try {
      const res = await this.get().exec(`DELETE FROM todos WHERE id = ${id};`);
    } catch (e) {
      return {
        ok: false,
        message: e.message,
      };
    }

    return {
      ok: true,
      message: `Task ${id} deleted`,
    };
  };
}
