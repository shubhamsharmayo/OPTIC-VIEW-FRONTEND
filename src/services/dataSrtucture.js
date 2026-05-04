const StructureData = (obj) => {
  const {
    formFieldWindowParameters,
    questionsWindowParameters,
    skewMarksWindowParameters,
    layoutParameters = {},
  } = obj;

  const renameKeys = (coordinate) =>
    coordinate
      ? {
          "End Col": coordinate["right"],
          "End Row": coordinate["end"],
          "Start Col": coordinate["left"],
          "Start Row": coordinate["start"],
          fieldType: coordinate["fieldType"],
          name: coordinate["name"],
        }
      : null;

  const coordinateOfFormData = formFieldWindowParameters
    ? formFieldWindowParameters
        .map((item) => ({
          ...item,
          Coordinate: renameKeys(item.formFieldCoordinates),
        }))
        .map((item) => {
          delete item.formFieldCoordinates;
          return item;
        })
    : [];

  const coordinateOfQuestionField = questionsWindowParameters
    ? questionsWindowParameters
        .map((item) => ({
          ...item,
          Coordinate: renameKeys(item.questionWindowCoordinates),
        }))
        .map((item) => {
          delete item.questionWindowCoordinates;
          return item;
        })
    : [];

  const coordinateOfSkewField = skewMarksWindowParameters
    ? skewMarksWindowParameters
        .map((item) => ({
          ...item,
          Coordinate: renameKeys(item.layoutWindowCoordinates),
        }))
        .map((item) => {
          delete item.layoutWindowCoordinates;
          return item;
        })
    : [];

  let coordinateOfIdField =
    layoutParameters.layoutCoordinates &&
    Object.keys(layoutParameters.layoutCoordinates).length > 0
      ? renameKeys(layoutParameters.layoutCoordinates)
      : [];
  console.log(coordinateOfIdField);
  if (coordinateOfIdField.start === 0 && coordinateOfIdField.end === 0) {
    coordinateOfIdField = {};
  }

  return {
    ...obj,
    formFieldWindowParameters: coordinateOfFormData,
    questionsWindowParameters: coordinateOfQuestionField,
    skewMarksWindowParameters: coordinateOfSkewField,
    layoutParameters: {
      ...layoutParameters,
      layoutCoordinates: coordinateOfIdField,
    },
  };
};

export default StructureData;
