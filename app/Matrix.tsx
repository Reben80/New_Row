import React from 'react';

interface MatrixProps {
  data: number[][];
}

const Matrix: React.FC<MatrixProps> = ({ data }) => {
  return (
    <div className="matrix-container">
      <table className="matrix">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Matrix;