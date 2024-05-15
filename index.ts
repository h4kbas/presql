class PreSqlTerminal {
  public val: string;

  constructor(val: string) {
    this.val = val;
  }

  toString() {
    return this.val;
  }
}

class PreSqlFunctionHead extends PreSqlTerminal {}
class PreSqlFunctionFoot extends PreSqlTerminal {}
class PreSqlFunctionConditonal extends PreSqlTerminal {}
class PreSqlFunctionLimit extends PreSqlTerminal {}
class PreSqlFunctionOffset extends PreSqlTerminal {}
class PreSqlFunctionOrder extends PreSqlTerminal {}
class PreSqlFunctionWith extends PreSqlTerminal {}
class PreSqlFunctionGroupBy extends PreSqlTerminal {}
class PreSqlFunctionHaving extends PreSqlTerminal {}
class PreSqlFunctionUnion extends PreSqlTerminal {}
class PreSqlFunctionIntersect extends PreSqlTerminal {}
class PreSqlFunctionExcept extends PreSqlTerminal {}
class PreSqlFunctionWindow extends PreSqlTerminal {}
class PreSqlFunctionPartitionBy extends PreSqlTerminal {}
class PreSqlWhenStatement extends PreSqlTerminal {}

type PreSqlSimpleSentence = [
  PreSqlFunctionHead,
  PreSqlFunctionFoot?,
  PreSqlFunctionConditonal?,
  PreSqlFunctionGroupBy?,
  PreSqlFunctionHaving?,
  PreSqlFunctionWindow?,
  PreSqlFunctionOrder?,
  PreSqlFunctionLimit?,
  PreSqlFunctionOffset?
];

type PreSqlComplexSentence = [
  ...PreSqlSimpleSentence,
  PreSqlFunctionUnion?,
  PreSqlFunctionIntersect?,
  PreSqlFunctionExcept?
];

type PreSqlSentence = [PreSqlFunctionWith?, ...PreSqlComplexSentence];

type Options = {
  active: boolean;
};

type PreSqlFunctionVal =
  | string
  | number
  | boolean
  | PreSqlSentence
  | [string | number | boolean | PreSqlSentence, Options];

export function WITH(...args: [PreSqlFunctionVal, PreSqlSentence][]) {
  return new PreSqlFunctionWith(
    `WITH ${args
      .map(([name, sentence]) => `${name} AS (${Q(...sentence)})`)
      .join(", ")}`
  );
}

export function Select(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionHead("SELECT " + args.join(", "));
}

export function From(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionFoot("FROM " + args.join(", "));
}

export function Join(
  type: string,
  table: PreSqlFunctionVal,
  method: "On" | "Using",
  ...args: PreSqlFunctionVal[]
) {
  return new PreSqlFunctionFoot(
    `${type} JOIN ${table} ${method} ${args.join(", ")}`
  );
}

export function LeftJoin(
  table: PreSqlFunctionVal,
  ...args: PreSqlFunctionVal[]
) {
  return Join("LEFT", table, "On", ...args);
}

export function RightJoin(
  table: PreSqlFunctionVal,
  ...args: PreSqlFunctionVal[]
) {
  return Join("RIGHT", table, "On", ...args);
}

export function FullJoin(
  table: PreSqlFunctionVal,
  ...args: PreSqlFunctionVal[]
) {
  return Join("FULL", table, "On", ...args);
}

export function InnerJoin(
  table: PreSqlFunctionVal,
  ...args: PreSqlFunctionVal[]
) {
  return Join("INNER", table, "On", ...args);
}

export function CrossJoin(table: PreSqlFunctionVal) {
  return new PreSqlFunctionFoot(`CROSS JOIN ${table}`);
}

export function Where(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionConditonal("WHERE " + args.join(" "));
}

export function Limit(arg: PreSqlFunctionVal) {
  return new PreSqlFunctionLimit("LIMIT " + arg);
}

export function Offset(arg: PreSqlFunctionVal) {
  return new PreSqlFunctionOffset("OFFSET " + arg);
}

export function OrderBy(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionOrder("ORDER BY " + args.join(", "));
}

export function GroupBy(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionGroupBy("GROUP BY " + args.join(", "));
}

export function Having(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionHaving("HAVING " + args.join(" "));
}

export function Union(...args: PreSqlSimpleSentence[]) {
  return new PreSqlFunctionUnion("UNION " + args.join(" UNION "));
}

export function Intersect(...args: PreSqlSimpleSentence[]) {
  return new PreSqlFunctionIntersect("INTERSECT " + args.join(" INTERSECT "));
}

export function Except(...args: PreSqlSimpleSentence[]) {
  return new PreSqlFunctionExcept("EXCEPT " + args.join(" EXCEPT "));
}

export function PartitionBy(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionPartitionBy("PARTITION BY " + args.join(", "));
}

export function Window(
  name: string,
  partitionBy?: PreSqlFunctionPartitionBy,
  orderBy?: PreSqlFunctionOrder
) {
  let partitionClause = partitionBy ? partitionBy.toString() : "";
  let orderClause = orderBy ? orderBy.toString() : "";
  return new PreSqlFunctionWindow(
    `WINDOW ${name} AS (${[partitionClause, orderClause]
      .filter(Boolean)
      .join(" ")})`
  );
}

export function Fn(name: string, ...args: PreSqlFunctionVal[]) {
  return `${name}(${args.join(", ")})`;
}

export function FnWithFilter(
  name: string,
  arg: PreSqlFunctionVal,
  filter?: PreSqlFunctionConditonal
) {
  return Fn(name, arg) + (filter ? ` FILTER(${filter})` : "");
}

export function Count(
  arg: PreSqlFunctionVal,
  filter?: PreSqlFunctionConditonal
) {
  return FnWithFilter("COUNT", arg, filter);
}

export function Sum(arg: PreSqlFunctionVal, filter?: PreSqlFunctionConditonal) {
  return FnWithFilter("SUM", arg, filter);
}

export function Avg(arg: PreSqlFunctionVal, filter?: PreSqlFunctionConditonal) {
  return FnWithFilter("AVG", arg, filter);
}

export function Min(arg: PreSqlFunctionVal, filter?: PreSqlFunctionConditonal) {
  return FnWithFilter("MIN", arg, filter);
}

export function Max(arg: PreSqlFunctionVal, filter?: PreSqlFunctionConditonal) {
  return FnWithFilter("MAX", arg, filter);
}

export function Coalesce(...args: PreSqlFunctionVal[]) {
  return Fn("COALESCE", ...args);
}

export function Q(...args: PreSqlSentence) {
  return args.map((arg) => arg?.toString()).join(" ");
}

export function When(when: PreSqlFunctionVal, then: PreSqlFunctionVal) {
  return new PreSqlWhenStatement(`WHEN ${when} THEN ${then}`);
}

export function Else(arg: PreSqlFunctionVal) {
  return new PreSqlWhenStatement(`ELSE ${arg}`);
}

export function Case(...args: PreSqlWhenStatement[]) {
  return `CASE ${args.join(" ")} END`;
}

export function As(arg: PreSqlFunctionVal, alias: string) {
  return `${arg} AS ${alias}`;
}

export function Cast(arg: PreSqlFunctionVal, type: string) {
  return `${arg}::${type}`;
}
