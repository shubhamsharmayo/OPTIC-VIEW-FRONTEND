export default function splitQuestionWindow({
  newData,
  selection,
  nums,
  selectedFieldType
}) {
  if (selectedFieldType !== "questionField") return {};

  const [startQ, endQ] = nums;
  const key = `q${startQ}-q${endQ}`;

  const result = {
    [key]: [],
  };

  for (let q = startQ; q <= endQ; q++) {
    result[key].push({
      iFace: newData.iFace,
      windowName: key, // ✅ keep q1-q8
      columnStart: newData.columnStart,
      columnNumber: newData.columnNumber,
      columnStep: newData.columnStep,
      rowStart: newData.rowStart,
      rowNumber: newData.rowNumber,
      rowStep: newData.rowStep,
      iDirection: newData.iDirection,
      iSensitivity: newData.iSensitivity,
      iDifference: newData.iDifference,
      iOption: newData.iOption,
      prefix: newData.prefix,
      suffix: newData.suffix,
      iMinimumMarks: newData.iMinimumMarks,
      iMaximumMarks: newData.iMaximumMarks,
      iType: newData.iType,
      ngAction: newData.ngAction,
      totalNumberOfFields: newData.totalNumberOfFields,
      numericOrAlphabets: newData.numericOrAlphabets,
      multipleAllow: newData.multipleAllow,
      multipleValue: newData.multipleValue,
      blankAllow: newData.blankAllow,
      blankValue: newData.blankValue,
      customFieldValue: newData.customFieldValue,
      formatting: newData.formatting,

      questionWindowCoordinates: {
        left: selection.startCol,
        right: selection.endCol,
        start: selection.startRow + 1,
        end: selection.endRow + 1,
        fieldType: "questionField",
        name: `q${q}`, // ✅ per-question identity
      },
    });
  }

  return result;
}
