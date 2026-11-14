export function equalQuery(field, value) {
  if (typeof field !== 'string' || !/^[A-Za-z][A-Za-z0-9_]*$/.test(field)) {
    throw new TypeError('A valid table column name is required.');
  }
  return encodeURIComponent(`equal(${JSON.stringify(field)}, ${JSON.stringify([String(value)])})`);
}

export function tableRowsPath(databaseId, tableId) {
  return `/tablesdb/${encodeURIComponent(databaseId)}/tables/${encodeURIComponent(tableId)}/rows`;
}

export function tableRowPath(databaseId, tableId, rowId) {
  return `${tableRowsPath(databaseId, tableId)}/${encodeURIComponent(rowId)}`;
}
