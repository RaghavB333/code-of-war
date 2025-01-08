import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 bg-background">
      <div className="container mx-auto px-6 lg:px-20">
        <h1 className="text-4xl font-extrabold text-center text-white mb-8">About Code of War</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 lg:p-10 bg-background">
          <p className="text-lg text-gray-100 mb-6">
            Welcome to <span className="font-bold text-green-50">Code of War</span>, the ultimate online coding platform for
            competitive programming enthusiasts, problem solvers, and coding aficionados. We aim to cultivate an engaging
            environment where developers of all skill levels can test their mettle, sharpen their coding skills, and
            compete against the best.
          </p>

          <h2 className="text-2xl font-bold text-gray-100 mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-100 mb-6">
            <li><span className="font-semibold">In-Built Code Editor and Compiler:</span> Code seamlessly in our integrated, feature-rich environment tailored for programmers.</li>
            <li><span className="font-semibold">Competitive Tournaments:</span> Participate in exciting coding competitions and rise to the top of the leaderboard.</li>
            <li><span className="font-semibold">Challenging Problems:</span> Solve curated problems that test your knowledge, logic, and creativity.</li>
            <li><span className="font-semibold">Global Leaderboards:</span> Compare your performance against programmers worldwide and strive for excellence.</li>
            <li><span className="font-semibold">Community:</span> Connect with like-minded individuals to learn, grow, and collaborate.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-100 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-100 mb-6">
            At Code of War, we believe that coding is more than just writing lines of code; it’s about solving problems,
            thinking critically, and creating innovative solutions. Our mission is to inspire developers to push their
            limits, learn from challenges, and become the best version of themselves.
          </p>

          <h2 className="text-2xl font-bold text-gray-100 mb-4">Why Choose Us?</h2>
          <p className="text-lg text-gray-100 mb-6">
            Unlike other platforms, Code of War is built with the developer in mind. We prioritize simplicity, performance,
            and accessibility to ensure that every user has an unparalleled experience. With regular updates, new challenges,
            and exciting tournaments, there’s always something to look forward to on Code of War.
          </p>

          <p className="text-lg text-gray-100">
            Whether you're a beginner looking to get started or a seasoned coder aiming for the top spot, Code of War has
            something for you. Join us today and become part of the ultimate coding battlefield!
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
