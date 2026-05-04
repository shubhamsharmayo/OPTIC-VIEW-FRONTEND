const skewQuestionNameGenerator = (questionName, count) => {
  if (!questionName) throw new Error("Question name is required.");

  // Function to extract numbers and letters separately
  const extractNumbersAndChars = (str) => {
    const numbers = str.match(/\d+/g)?.join("") || "0"; // Extract digits
    const chars = str.match(/[^\d]+/g)?.join("") || ""; // Extract non-digits
    return { num: Number(numbers), chars };
  };

  if (questionName.includes("-")) {
    // Case 1: Format X123-Y456
    const splitParts = questionName.split("-");
    if (splitParts.length !== 2) {
      throw new Error("Invalid format. Expected format: 'X123-Y456' or 'skew1'");
    }

    const firstPart = extractNumbersAndChars(splitParts[0]);
    const secondPart = extractNumbersAndChars(splitParts[1]);

    const diff = secondPart.num - firstPart.num;
    if (diff < 0) throw new Error("Invalid range: Second number must be greater than first");

    // Base case: If count is 0, return the current questionName
    if (count === 0) return questionName;

    // Calculate next sequence
    let newStartNum = secondPart.num + 1;
    let newEndNum = newStartNum + diff;

    let nextQuestionName = `${firstPart.chars}${newStartNum}-${secondPart.chars}${newEndNum}`;

    // Recursive call with reduced count
    return skewQuestionNameGenerator(nextQuestionName, count - 1);

  } else {
    // Case 2: Format like 'skew1'
    const { num, chars } = extractNumbersAndChars(questionName);

    if (count === 0) return questionName;

    const nextQuestionName = `${chars}${num + 1}`;

    // Recursive call with reduced count
    return skewQuestionNameGenerator(nextQuestionName, count - 1);
  }
};

export default skewQuestionNameGenerator;
