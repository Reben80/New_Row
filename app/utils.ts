export const generateRandomMatrix = (): number[][] => {
    const rows = 3;
    const cols = 4;
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(Math.floor(Math.random() * 10)); // Random number between 0 and 9
      }
      matrix.push(row);
    }
    return matrix;
  };

const swapRows = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const rows = matrix.length;
    const i = Math.floor(Math.random() * rows);
    let j;
    do {
      j = Math.floor(Math.random() * rows);
    } while (i === j);
    const newMatrix = matrix.map(row => [...row]);
    [newMatrix[i], newMatrix[j]] = [newMatrix[j], newMatrix[i]];
    const operation = `R${i + 1} ↔ R${j + 1}`;
    return { newMatrix, operation };
  };

const multiplyRowByScalar = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const rows = matrix.length;
    const i = Math.floor(Math.random() * rows);
    const n = Math.floor(Math.random() * 9) + 1; // Random non-zero integer between 1 and 9
    const newMatrix = matrix.map(row => [...row]);
    for (let k = 0; k < matrix[0].length; k++) {
      newMatrix[i][k] *= n;
    }
    const operation = `R${i + 1} → ${n}R${i + 1}`;
    return { newMatrix, operation };
  };

const addMultipleOfRow = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const rows = matrix.length;
    const i = Math.floor(Math.random() * rows);
    let j;
    do {
      j = Math.floor(Math.random() * rows);
    } while (i === j);
    const n = Math.floor(Math.random() * 9) + 1; // Random non-zero integer between 1 and 9
    const newMatrix = matrix.map(row => [...row]);
    for (let k = 0; k < matrix[0].length; k++) {
      newMatrix[i][k] += n * matrix[j][k];
    }
    const operation = `R${i + 1} → R${i + 1} + ${n}R${j + 1}`;
    return { newMatrix, operation };
  };

export const applyRandomRowOperation = (matrix: number[][]): { newMatrix: number[][], operation: string } => {
    const operations = [swapRows, multiplyRowByScalar, addMultipleOfRow];
    const randomOperation = operations[Math.floor(Math.random() * operations.length)];
    return randomOperation(matrix);
  };

export const generateOptions = (correctOperation: string): string[] => {
    const options = [correctOperation];
    while (options.length < 4) {
      const i = Math.floor(Math.random() * 3) + 1;
      let j;
      do {
        j = Math.floor(Math.random() * 3) + 1;
      } while (i === j);
      const n = Math.floor(Math.random() * 9) + 1;
      const operation = `R${i} → R${i} + ${n}R${j}`;
      if (!options.includes(operation)) {
        options.push(operation);
      }
    }
    return options.sort(() => Math.random() - 0.5); // Shuffle options
  };