import React from "react";

const FoodWarning = () => {
  return (
    <div className="food-warning">
      <h2>Food Warnings</h2>
      <p>Be cautious of the following foods during your pregnancy:</p>
      <ul>
        <li>Raw or undercooked seafood, eggs, and meat</li>
        <li>Unpasteurized dairy products</li>
        <li>Certain fish high in mercury (e.g., shark, swordfish)</li>
        <li>Processed junk foods</li>
      </ul>
    </div>
  );
};

export default FoodWarning;