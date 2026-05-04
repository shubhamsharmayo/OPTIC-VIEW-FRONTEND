const groupQuestionNameGenerator = (questionName, nextStartNum) => {
  const splitParts = questionName.split("-");

  if (splitParts.length !== 2) {
    throw new Error("Invalid format. Expected format: 'X123-Y456'");
  }

  // Function to extract numbers and letters separately
  const extractNumbersAndChars = (str) => {
    const numbers = str.match(/\d+/g)?.join("") || "0"; // Extract digits
    const chars = str.match(/[^\d]+/g)?.join("") || ""; // Extract non-digits
    return { num: Number(numbers), chars };
  };

  const firstPart = extractNumbersAndChars(splitParts[0]);
  const secondPart = extractNumbersAndChars(splitParts[1]);

  const diff = secondPart.num - firstPart.num;
  if (diff < 0) throw new Error("Invalid range: Second number must be greater than first");

  const newStartNum = nextStartNum;
  const newEndNum = newStartNum + diff;

  const nextQuestionName = `${firstPart.chars}${newStartNum}-${secondPart.chars}${newEndNum}`;

  return nextQuestionName;
};

export default groupQuestionNameGenerator;
