class PreSqlTerminal {
  constructor(public val: string) {
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

type PreSqlSimpleSentence = [
  PreSqlFunctionHead,
  PreSqlFunctionFoot?,
  PreSqlFunctionConditonal?,
  PreSqlFunctionGroupBy?,
  PreSqlFunctionHaving?,
  PreSqlFunctionOrder?,
  PreSqlFunctionLimit?,
  PreSqlFunctionOffset?
];

type PreSqlSentence =
  | [PreSqlFunctionWith, ...PreSqlSimpleSentence]
  | PreSqlSimpleSentence;

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

export function SELECT(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionHead("SELECT " + args.join(", "));
}

export function FROM(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionFoot("FROM " + args.join(", "));
}

export function WHERE(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionConditonal("WHERE " + args.join(" "));
}

export function LIMIT(arg: PreSqlFunctionVal) {
  return new PreSqlFunctionLimit("LIMIT " + arg);
}

export function OFFSET(arg: PreSqlFunctionVal) {
  return new PreSqlFunctionOffset("OFFSET " + arg);
}

export function ORDERBY(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionOrder("ORDER BY " + args.join(", "));
}

export function GROUPBY(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionGroupBy("GROUP BY " + args.join(", "));
}

export function HAVING(...args: PreSqlFunctionVal[]) {
  return new PreSqlFunctionHaving("HAVING " + args.join(" "));
}

export function COUNT(
  arg: PreSqlFunctionVal,
  filter?: PreSqlFunctionConditonal
) {
  return `COUNT(${arg})` + (filter ? ` FILTER(${filter})` : "");
}

export function Q(...args: PreSqlSentence) {
  return args.map((arg) => arg?.toString()).join(" ");
}

// Example usage
let output = Q(
  WITH(
    ["t1", [SELECT("name"), FROM("users"), WHERE("id = 1")]],
    ["t2", [SELECT("name"), FROM("users"), WHERE("id = 1")]]
  ),
  SELECT("name", "email"),
  FROM("users"),
  WHERE("id = 1", "name='hello'"),
  GROUPBY("name"),
  HAVING(COUNT("id", WHERE("name='test'"))),
  ORDERBY("id DESC"),
  LIMIT(1),
  OFFSET(1)
);

console.log(output);
