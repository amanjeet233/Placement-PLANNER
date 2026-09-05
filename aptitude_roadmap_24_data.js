// Placement Aptitude Roadmap — 24 Chapters Dataset
// Taught by Abhinay Sharma (Abhinay Maths) — Zero Revision Videos
window.aptitudeRoadmapData = [
  {
    "chapterId": 1,
    "chapterNumber": "#01",
    "name": "Number System",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 1–2",
    "difficulty": "Easy",
    "lessons": "21 Lessons",
    "youtubeTitle": "Number System By Abhinay Sharma (Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYjYuuCUr9zgqiBUESVwmYD",
    "description": "Classification of numbers, divisibility rules, unit digit, remainder theorem, factors, and number of trailing zeros.",
    "questions": [
      {
        "id": "apt_1_1",
        "question": "Find the unit digit in the expression (7^95 - 3^58).",
        "options": [
          "0",
          "4",
          "6",
          "7"
        ],
        "correctIndex": 1,
        "explanation": "Cyclicity of 7 is 4: 95 mod 4 = 3, so 7^3 ends in 3. Cyclicity of 3 is 4: 58 mod 4 = 2, so 3^2 ends in 9. Since (..3 - ..9), we borrow 1 from tens digit: 13 - 9 = 4. Unit digit is 4.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_1_2",
        "question": "If the 7-digit number 5432a7b is divisible by 90, find the value of (a + b).",
        "options": [
          "4",
          "5",
          "6",
          "7"
        ],
        "correctIndex": 2,
        "explanation": "For divisibility by 90 = 9 × 10, the last digit b must be 0. For divisibility by 9, sum of digits (5+4+3+2+a+7+0 = 21 + a) must be divisible by 9. The smallest digit a is 6 (21 + 6 = 27). Wait: 21+6=27, so a=6, b=0, a+b=6.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      },
      {
        "id": "apt_1_3",
        "question": "Find the number of trailing zeroes in 125! (125 factorial).",
        "options": [
          "25",
          "28",
          "30",
          "31"
        ],
        "correctIndex": 3,
        "explanation": "Trailing zeroes = ⌊125/5⌋ + ⌊125/25⌋ + ⌊125/125⌋ = 25 + 5 + 1 = 31 zeroes.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_1_4",
        "question": "What is the remainder when (2^100) is divided by 7?",
        "options": [
          "1",
          "2",
          "4",
          "6"
        ],
        "correctIndex": 1,
        "explanation": "2^3 = 8 ≡ 1 (mod 7). 100 = 3 × 33 + 1. So 2^100 = (2^3)^33 × 2^1 ≡ (1)^33 × 2 ≡ 2 (mod 7). Remainder is 2.",
        "difficulty": "Medium",
        "sourceTag": "Cognizant"
      }
    ]
  },
  {
    "chapterId": 2,
    "chapterNumber": "#02",
    "name": "HCF & LCM",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 2",
    "difficulty": "Easy",
    "lessons": "8 Lessons",
    "youtubeTitle": "HCF & LCM By Abhinay Sharma (Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYrYT-VcGtJnmnxDPOCSTLk",
    "description": "Prime factorization, division method, co-primes, circular track alarms, and bell-ringing patterns.",
    "questions": [
      {
        "id": "apt_2_1",
        "question": "Four bells toll together at 9:00 AM. They toll after intervals of 6, 8, 12, and 18 seconds respectively. In the next 60 minutes, how many times will they toll together?",
        "options": [
          "48",
          "50",
          "51",
          "60"
        ],
        "correctIndex": 1,
        "explanation": "LCM(6, 8, 12, 18) = 72 seconds. In 60 minutes = 3600 seconds: (3600 / 72) = 50 times (excluding the starting toll, or 50 times in the next 60 mins).",
        "difficulty": "Medium",
        "sourceTag": "Accenture"
      },
      {
        "id": "apt_2_2",
        "question": "The HCF and LCM of two numbers are 12 and 336 respectively. If one of the numbers is 84, find the other number.",
        "options": [
          "36",
          "48",
          "56",
          "64"
        ],
        "correctIndex": 1,
        "explanation": "Product of two numbers = HCF × LCM => 84 × Other = 12 × 336 => Other = (12 × 336) / 84 = 336 / 7 = 48.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_2_3",
        "question": "Find the greatest number which divides 29, 60, and 103 leaving remainders 5, 12, and 7 respectively.",
        "options": [
          "12",
          "16",
          "24",
          "32"
        ],
        "correctIndex": 2,
        "explanation": "Numbers to divide exactly: (29 - 5) = 24, (60 - 12) = 48, (103 - 7) = 96. HCF(24, 48, 96) = 24.",
        "difficulty": "Medium",
        "sourceTag": "Capgemini"
      },
      {
        "id": "apt_2_4",
        "question": "Find the HCF of fractions 2/3, 8/9, 10/27, and 16/81.",
        "options": [
          "2/81",
          "16/3",
          "8/27",
          "2/3"
        ],
        "correctIndex": 0,
        "explanation": "HCF of fractions = HCF of Numerators / LCM of Denominators = HCF(2, 8, 10, 16) / LCM(3, 9, 27, 81) = 2 / 81.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 3,
    "chapterNumber": "#03",
    "name": "Percentage",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 2–3",
    "difficulty": "Medium",
    "lessons": "Full Master Series",
    "youtubeTitle": "Percentage by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhaUqy2BwUiDZDyGwlPzG3Yk",
    "description": "Fraction-to-percentage table, successive percentage changes, price-consumption-expenditure, voting & election problems.",
    "questions": [
      {
        "id": "apt_3_1",
        "question": "If the price of sugar is increased by 25%, by what percent must a household reduce its consumption so as not to increase the expenditure?",
        "options": [
          "15%",
          "20%",
          "22.5%",
          "25%"
        ],
        "correctIndex": 1,
        "explanation": "Reduction % = [r / (100 + r)] × 100% = [25 / 125] × 100% = 1/5 × 100% = 20%.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_3_2",
        "question": "In an election between two candidates, the winner gets 64% of the total votes and wins by a majority of 2240 votes. What was the total number of votes cast?",
        "options": [
          "6000",
          "7000",
          "8000",
          "9000"
        ],
        "correctIndex": 2,
        "explanation": "Winner = 64%, Loser = 36%. Majority = 64% - 36% = 28%. 28% of Total = 2240 => Total = (2240 × 100) / 28 = 80 × 100 = 8000.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_3_3",
        "question": "A number is first increased by 20% and then decreased by 20%. What is the net change in the number?",
        "options": [
          "No change",
          "4% increase",
          "4% decrease",
          "2% decrease"
        ],
        "correctIndex": 2,
        "explanation": "Net change = (+20 - 20 - (20 × 20)/100)% = -4% (i.e. 4% decrease).",
        "difficulty": "Easy",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_3_4",
        "question": "Fresh fruit contains 68% water and dry fruit contains 20% water. How many kg of dry fruit can be obtained from 100 kg of fresh fruit?",
        "options": [
          "32 kg",
          "40 kg",
          "48 kg",
          "52 kg"
        ],
        "correctIndex": 1,
        "explanation": "Pulp content remains constant. Pulp in 100 kg fresh fruit = (100 - 68)% × 100 = 32 kg. In dry fruit, pulp is (100 - 20)% = 80%. Let dry fruit weight be W: 80% × W = 32 => W = (32 × 100) / 80 = 40 kg.",
        "difficulty": "Hard",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 4,
    "chapterNumber": "#04",
    "name": "Profit & Loss",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 3",
    "difficulty": "Medium",
    "lessons": "12 Lessons",
    "youtubeTitle": "PROFIT LOSS 2020 by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhZRmbg38sKR3B6xwy1fWEiQ",
    "description": "Cost price, selling price, marked price, successive discounts, dishonest shopkeeper tricks, and profit on selling price.",
    "questions": [
      {
        "id": "apt_4_1",
        "question": "A dishonest dealer professes to sell his goods at cost price, but he uses a weight of 950 grams for a kg weight. Find his gain percentage.",
        "options": [
          "4.5%",
          "5.26%",
          "5.5%",
          "6.12%"
        ],
        "correctIndex": 1,
        "explanation": "Gain % = [Error / (True Value - Error)] × 100% = [50 / 950] × 100% = 500 / 95 = 5.26% (or 5 5/19%).",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_4_2",
        "question": "A man sold two articles for ₹1200 each. On one he gained 20% and on the other he lost 20%. Find his overall gain or loss percentage.",
        "options": [
          "No profit no loss",
          "2% loss",
          "4% loss",
          "4% gain"
        ],
        "correctIndex": 2,
        "explanation": "When two articles have equal Selling Price and one is sold at x% profit while other at x% loss, overall is always a loss of (x/10)^2% = (20/10)^2% = 4% loss.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_4_3",
        "question": "Find the single discount equivalent to a series of successive discounts of 20%, 10%, and 5%.",
        "options": [
          "31.6%",
          "32.5%",
          "35%",
          "31.2%"
        ],
        "correctIndex": 0,
        "explanation": "SP = 100 × (0.80) × (0.90) × (0.95) = 100 × 0.684 = 68.4. Equivalent discount = 100 - 68.4 = 31.6%.",
        "difficulty": "Easy",
        "sourceTag": "Capgemini"
      },
      {
        "id": "apt_4_4",
        "question": "By selling 33 meters of cloth, a merchant gains the selling price of 11 meters. Find his gain percentage.",
        "options": [
          "33.33%",
          "40%",
          "50%",
          "66.67%"
        ],
        "correctIndex": 2,
        "explanation": "Gain = SP of 11. Gain = SP of 33 - CP of 33 => SP of 11 = SP of 33 - CP of 33 => CP of 33 = SP of 22 => Profit % = (33 - 22)/22 × 100% = 11/22 × 100% = 50%.",
        "difficulty": "Hard",
        "sourceTag": "Accenture"
      }
    ]
  },
  {
    "chapterId": 5,
    "chapterNumber": "#05",
    "name": "Simple Interest",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 3–4",
    "difficulty": "Easy",
    "lessons": "4 Lessons",
    "youtubeTitle": "SIMPLE INTEREST NEW 2020 by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhawigEPP0GN2ZLb6Gy5fZow",
    "description": "PRT/100, installment problems, rate change variations, and amount doubling in n years concepts.",
    "questions": [
      {
        "id": "apt_5_1",
        "question": "A sum of money at simple interest doubles itself in 8 years. In how many years will it become 4 times itself?",
        "options": [
          "16 years",
          "20 years",
          "24 years",
          "32 years"
        ],
        "correctIndex": 2,
        "explanation": "In 8 years, interest earned = 1P. To become 4 times (Amount = 4P), interest needed = 3P. Time required = 3 × 8 = 24 years.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_5_2",
        "question": "A sum of ₹12,500 amounts to ₹15,500 in 4 years at the rate of simple interest. What is the rate of interest?",
        "options": [
          "5%",
          "6%",
          "7.5%",
          "8%"
        ],
        "correctIndex": 1,
        "explanation": "SI = 15500 - 12500 = ₹3000. R = (SI × 100) / (P × T) = (3000 × 100) / (12500 × 4) = 300000 / 50000 = 6%.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      },
      {
        "id": "apt_5_3",
        "question": "If the annual rate of simple interest increases from 10% to 12.5%, a man's yearly income increases by ₹1250. His principal is:",
        "options": [
          "₹40,000",
          "₹45,000",
          "₹50,000",
          "₹60,000"
        ],
        "correctIndex": 2,
        "explanation": "Difference in rate = 12.5% - 10% = 2.5%. 2.5% of P = 1250 => P = (1250 × 100) / 2.5 = ₹50,000.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_5_4",
        "question": "A sum of money lent out at simple interest amounts to ₹720 after 2 years and to ₹1020 after a further period of 5 years. Find the sum.",
        "options": [
          "₹500",
          "₹600",
          "₹640",
          "₹700"
        ],
        "correctIndex": 1,
        "explanation": "SI for 5 years = 1020 - 720 = ₹300 => SI for 1 year = ₹60. SI for 2 years = 2 × 60 = ₹120. Principal = 720 - 120 = ₹600.",
        "difficulty": "Medium",
        "sourceTag": "Cognizant"
      }
    ]
  },
  {
    "chapterId": 6,
    "chapterNumber": "#06",
    "name": "Compound Interest",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 4",
    "difficulty": "Medium",
    "lessons": "10 Lessons",
    "youtubeTitle": "Compound Interest New 2020 by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhZcyZ9KchybXJbnyu5cbWS_",
    "description": "Tree method, ratio method, difference between CI and SI for 2 & 3 years, semi-annual compounding.",
    "questions": [
      {
        "id": "apt_6_1",
        "question": "The difference between simple and compound interest on ₹15,000 for 2 years is ₹96. What is the annual rate of interest?",
        "options": [
          "6%",
          "7%",
          "8%",
          "9%"
        ],
        "correctIndex": 2,
        "explanation": "Difference for 2 years = P × (R / 100)^2 => 96 = 15000 × (R/100)^2 => (R/100)^2 = 96 / 15000 = 0.0064 => R / 100 = 0.08 => R = 8%.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_6_2",
        "question": "A sum of money invested at compound interest doubles in 5 years. In how many years will it become 8 times itself?",
        "options": [
          "15 years",
          "20 years",
          "25 years",
          "30 years"
        ],
        "correctIndex": 0,
        "explanation": "Amount becomes 2^1 in 5 years. To become 8 times = 2^3 times, time required = 3 × 5 = 15 years.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_6_3",
        "question": "Find the compound interest on ₹10,000 in 2 years at 10% per annum, interest compounded half-yearly.",
        "options": [
          "₹2100",
          "₹2155.06",
          "₹2200",
          "₹2240.25"
        ],
        "correctIndex": 1,
        "explanation": "Rate = 10/2 = 5% per half-year, n = 2 × 2 = 4 periods. A = 10000 × (1.05)^4 = 10000 × 1.215506 = ₹12,155.06. CI = 12155.06 - 10000 = ₹2,155.06.",
        "difficulty": "Hard",
        "sourceTag": "Placement Level"
      },
      {
        "id": "apt_6_4",
        "question": "A certain sum amounts to ₹7350 in 2 years and ₹8575 in 3 years at compound interest. Find the rate of interest per annum.",
        "options": [
          "12.5%",
          "14.28%",
          "16.67%",
          "20%"
        ],
        "correctIndex": 2,
        "explanation": "Interest for 3rd year = 8575 - 7350 = ₹1225. Rate = (1225 / 7350) × 100% = (1/6) × 100% = 16.67%.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      }
    ]
  },
  {
    "chapterId": 7,
    "chapterNumber": "#07",
    "name": "Average",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 4",
    "difficulty": "Easy",
    "lessons": "6 Lessons",
    "youtubeTitle": "Average - Arithmetic by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhbE73RJo2f_YUppXuXbJoen",
    "description": "Deviation method, batsman batting average, replacement and inclusion of members, weighted average.",
    "questions": [
      {
        "id": "apt_7_1",
        "question": "The average weight of 24 students in a class is 40 kg. If the teacher's weight is included, the average increases by 1 kg. Find the weight of the teacher.",
        "options": [
          "60 kg",
          "64 kg",
          "65 kg",
          "66 kg"
        ],
        "correctIndex": 2,
        "explanation": "Teacher's weight = Old Average + (New Total Members × Increase) = 40 + (25 × 1) = 65 kg.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_7_2",
        "question": "A cricketer has a certain average of runs for his 11 innings. In the 12th innings, he makes a score of 90 runs and thereby increases his average by 5. Find his new average.",
        "options": [
          "30",
          "35",
          "40",
          "45"
        ],
        "correctIndex": 1,
        "explanation": "Let old average be x. Total runs in 11 innings = 11x. 11x + 90 = 12(x + 5) => 11x + 90 = 12x + 60 => x = 30. New average = 30 + 5 = 35.",
        "difficulty": "Medium",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_7_3",
        "question": "The average of 5 consecutive odd numbers is 61. What is the difference between the highest and lowest numbers?",
        "options": [
          "4",
          "6",
          "8",
          "10"
        ],
        "correctIndex": 2,
        "explanation": "Numbers are x-4, x-2, x, x+2, x+4. Difference between highest and lowest = (x+4) - (x-4) = 8.",
        "difficulty": "Easy",
        "sourceTag": "Accenture"
      },
      {
        "id": "apt_7_4",
        "question": "The average temperature for Monday, Tuesday, and Wednesday was 40°C. The average for Tuesday, Wednesday, and Thursday was 41°C. If on Thursday it was 42°C, what was the temperature on Monday?",
        "options": [
          "38°C",
          "39°C",
          "40°C",
          "41°C"
        ],
        "correctIndex": 1,
        "explanation": "(M + T + W) = 120. (T + W + Th) = 123. Subtracting: Th - M = 3. Since Th = 42, M = 42 - 3 = 39°C.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 8,
    "chapterNumber": "#08",
    "name": "Ratio & Proportion",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 4–5",
    "difficulty": "Medium",
    "lessons": "4 Lessons",
    "youtubeTitle": "Ratio and Proportion by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhZfzXKNhQGvlsf88FgWqMy9",
    "description": "Compound ratio, fourth/third/mean proportional, coin-box problems, income-expenditure ratios.",
    "questions": [
      {
        "id": "apt_8_1",
        "question": "A bag contains ₹1, 50 paise, and 25 paise coins in the ratio 3 : 8 : 20 amounting to ₹372. Find the total number of coins in the bag.",
        "options": [
          "930",
          "961",
          "992",
          "1024"
        ],
        "correctIndex": 1,
        "explanation": "Value ratio = 3×1 + 8×0.5 + 20×0.25 = 3 + 4 + 5 = 12 units. 12 units = ₹372 => 1 unit = ₹31. Coins = 31 × (3 + 8 + 20) = 31 × 31 = 961... wait: (31 * 32)? 3+8+20 = 31 coins per unit. 31 × 31 = 961... wait, let check 3:8:20 => 3*1=3, 8*0.5=4, 20*0.25=5. 3+4+5=12. 372/12 = 31. Total coins = 31 * (3+8+20) = 31 * 31 = 961. Let's make options exact: 930, 961, 992, 1024.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_8_2",
        "question": "If A : B = 2 : 3, B : C = 4 : 5, and C : D = 6 : 7, find A : D.",
        "options": [
          "16 : 35",
          "12 : 35",
          "8 : 15",
          "16 : 45"
        ],
        "correctIndex": 0,
        "explanation": "A/D = (A/B) × (B/C) × (C/D) = (2/3) × (4/5) × (6/7) = 48 / 105 = 16 / 35.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_8_3",
        "question": "Find the mean proportional between 9 and 64.",
        "options": [
          "18",
          "24",
          "27",
          "36"
        ],
        "correctIndex": 1,
        "explanation": "Mean proportional = √(9 × 64) = 3 × 8 = 24.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_8_4",
        "question": "Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new ratio becomes 12 : 23. Find the smaller number.",
        "options": [
          "27",
          "33",
          "45",
          "55"
        ],
        "correctIndex": 1,
        "explanation": "(3x - 9)/(5x - 9) = 12/23 => 69x - 207 = 60x - 108 => 9x = 99 => x = 11. Smaller number = 3x = 33.",
        "difficulty": "Medium",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 9,
    "chapterNumber": "#09",
    "name": "Partnership",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 5",
    "difficulty": "Easy",
    "lessons": "Full Course",
    "youtubeTitle": "Partnership By Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYM_2JsX_lrBz3B0zHgCEHV",
    "description": "Investment × Time = Profit ratio, working vs sleeping partner salary allocations, capital withdrawal.",
    "questions": [
      {
        "id": "apt_9_1",
        "question": "A and B invest in a business in the ratio 3 : 2. If 5% of the total profit goes to charity and A's share is ₹855, find the total profit.",
        "options": [
          "₹1400",
          "₹1500",
          "₹1600",
          "₹1800"
        ],
        "correctIndex": 1,
        "explanation": "Let total profit be P. Profit to distribute = 0.95P. A's share = (3/5) × 0.95P = 0.57P. 0.57P = 855 => P = 855 / 0.57 = ₹1500.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_9_2",
        "question": "A, B, and C start a business. A invests ₹25,000 for 1 year, B invests ₹30,000 for 8 months, and C invests ₹40,000 for 6 months. What is B's share in a total profit of ₹39,000?",
        "options": [
          "₹10,000",
          "₹12,000",
          "₹14,000",
          "₹15,000"
        ],
        "correctIndex": 1,
        "explanation": "Ratio = (25×12) : (30×8) : (40×6) = 300 : 240 : 240 = 5 : 4 : 4. B's share = (4 / 13) × 35000... wait: 25*12=300, 30*8=240, 40*6=240 -> divide by 60 -> 5:4:4 sum=13. If profit is ₹39,000: B's share = (4/13)*39000 = ₹12,000.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_9_3",
        "question": "A starts business with ₹3500 and after 5 months, B joins with A as his partner. After a year, the profit is divided in the ratio 2 : 3. How much did B contribute?",
        "options": [
          "₹7500",
          "₹8000",
          "₹9000",
          "₹9600"
        ],
        "correctIndex": 2,
        "explanation": "(3500 × 12) / (B × 7) = 2 / 3 => (500 × 12) / B = 2 / 3 => 6000 / B = 2 / 3 => 2B = 18000 => B = ₹9000.",
        "difficulty": "Medium",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_9_4",
        "question": "Three partners A, B, C share profit in ratio 5 : 7 : 8. They partnered for 14 months, 8 months, and 7 months respectively. What was the ratio of their investments?",
        "options": [
          "20 : 49 : 64",
          "25 : 35 : 40",
          "15 : 20 : 28",
          "10 : 15 : 21"
        ],
        "correctIndex": 0,
        "explanation": "Investment = Profit / Time => A : B : C = (5/14) : (7/8) : (8/7). Multiply by LCM(14, 8, 7) = 56: (5×4) : (7×7) : (8×8) = 20 : 49 : 64.",
        "difficulty": "Hard",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 10,
    "chapterNumber": "#10",
    "name": "Mixture & Allegation",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 5",
    "difficulty": "Medium",
    "lessons": "6 Lessons",
    "youtubeTitle": "Mixture Allegation 2020 by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYa0rtY9hGjKYpnzBNynaxo",
    "description": "Alligation cross rule, repeated replacement / dilution formula, mixing liquids of different ratios.",
    "questions": [
      {
        "id": "apt_10_1",
        "question": "In what ratio must rice at ₹9.30 per kg be mixed with rice at ₹10.80 per kg so that the mixture be worth ₹10 per kg?",
        "options": [
          "4 : 3",
          "7 : 8",
          "8 : 7",
          "3 : 4"
        ],
        "correctIndex": 2,
        "explanation": "By Alligation: (10.80 - 10.00) : (10.00 - 9.30) = 0.80 : 0.70 = 8 : 7.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_10_2",
        "question": "A vessel contains 60 liters of milk. 6 liters of milk is taken out and replaced by water. This process is repeated two more times. How much milk is left in the vessel now?",
        "options": [
          "42.54 liters",
          "43.74 liters",
          "45.00 liters",
          "48.20 liters"
        ],
        "correctIndex": 1,
        "explanation": "Milk remaining = Initial × (1 - x/C)^n = 60 × (1 - 6/60)^3 = 60 × (0.9)^3 = 60 × 0.729 = 43.74 liters.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_10_3",
        "question": "A 20-liter mixture of milk and water contains 10% water. How much water must be added to make it 20% water?",
        "options": [
          "1.5 liters",
          "2.0 liters",
          "2.5 liters",
          "3.0 liters"
        ],
        "correctIndex": 2,
        "explanation": "Milk is constant = 90% of 20 = 18 liters. In new mixture, milk is 80%. New Total = 18 / 0.8 = 22.5 liters. Water added = 22.5 - 20 = 2.5 liters.",
        "difficulty": "Easy",
        "sourceTag": "Accenture"
      },
      {
        "id": "apt_10_4",
        "question": "Two alloys A and B contain gold and copper in ratios 7 : 2 and 7 : 11 respectively. If equal quantities are melted to form alloy C, find the ratio of gold and copper in C.",
        "options": [
          "7 : 5",
          "5 : 7",
          "9 : 5",
          "7 : 9"
        ],
        "correctIndex": 0,
        "explanation": "In A: Gold = 7/9, Copper = 2/9. In B: Gold = 7/18, Copper = 11/18. Equalize quantities (make total 18): In A: 14/18 and 4/18. In B: 7/18 and 11/18. Total Gold = 14 + 7 = 21. Total Copper = 4 + 11 = 15. Ratio = 21 : 15 = 7 : 5.",
        "difficulty": "Hard",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 11,
    "chapterNumber": "#11",
    "name": "Time & Work",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 5",
    "difficulty": "Medium",
    "lessons": "36 Lessons",
    "youtubeTitle": "Time And Work By Abhinay Sharma (Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhbn5khtiG7s29SWPL1ki5RP",
    "description": "LCM efficiency method, wages distribution, alternate day work, leaving/joining before completion, pipes and cisterns.",
    "questions": [
      {
        "id": "apt_11_1",
        "question": "A can complete a piece of work in 12 days, and B in 18 days. They worked together for 4 days, then A left. In how many more days will B finish the remaining work?",
        "options": [
          "6 days",
          "8 days",
          "10 days",
          "12 days"
        ],
        "correctIndex": 1,
        "explanation": "LCM(12, 18) = 36 units. Efficiency of A = 3, B = 2. Together in 4 days: 4 × (3 + 2) = 20 units. Remaining = 36 - 20 = 16 units. B finishes in: 16 / 2 = 8 days.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_11_2",
        "question": "A is thrice as good a workman as B and therefore is able to finish a job in 60 days less than B. Working together, they can do it in:",
        "options": [
          "20 days",
          "22.5 days",
          "25 days",
          "30 days"
        ],
        "correctIndex": 1,
        "explanation": "Efficiency ratio A : B = 3 : 1 => Time ratio = 1 : 3. Difference in time = 2 units = 60 days => 1 unit = 30 days. So A takes 30 days, B takes 90 days. Together = (30 × 90)/(30 + 90) = 2700 / 120 = 22.5 days.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_11_3",
        "question": "Two pipes A and B can fill a cistern in 20 and 30 minutes respectively, while pipe C can empty it in 15 minutes. If all three are opened together, in how many minutes will the cistern be full?",
        "options": [
          "45 min",
          "60 min",
          "75 min",
          "Never"
        ],
        "correctIndex": 1,
        "explanation": "LCM(20, 30, 15) = 60 units. Efficiency of A = +3, B = +2, C = -4. Net efficiency = 3 + 2 - 4 = +1 unit/min. Time required = 60 / 1 = 60 minutes.",
        "difficulty": "Medium",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_11_4",
        "question": "12 men or 18 women can harvest a field in 14 days. In how many days can 8 men and 16 women harvest the same field?",
        "options": [
          "8 days",
          "9 days",
          "10 days",
          "12 days"
        ],
        "correctIndex": 1,
        "explanation": "12 Men = 18 Women => 1 Man = 1.5 Women. Total work = 18 Women × 14 days = 252 woman-days. Workforce = 8 Men + 16 Women = (8 × 1.5) + 16 = 12 + 16 = 28 women. Time = 252 / 28 = 9 days.",
        "difficulty": "Hard",
        "sourceTag": "Capgemini"
      }
    ]
  },
  {
    "chapterId": 12,
    "chapterNumber": "#12",
    "name": "Time, Speed & Distance",
    "category": "Arithmetic",
    "categoryIcon": "🟦",
    "week": "Week 5",
    "difficulty": "Hard",
    "lessons": "7 Lessons",
    "youtubeTitle": "Time Speed & Distance By Abhinay Sharma (Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhbAXx2cja-mfX1ix3pkka4J",
    "description": "Relative speed, trains crossing poles and platforms, boats and streams, circular track races, average speed harmonic mean.",
    "questions": [
      {
        "id": "apt_12_1",
        "question": "A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?",
        "options": [
          "65 sec",
          "89 sec",
          "95 sec",
          "100 sec"
        ],
        "correctIndex": 1,
        "explanation": "Speed of train = 240 / 24 = 10 m/s. Total distance for platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_12_2",
        "question": "A man goes from city A to B at 60 km/h and returns at 40 km/h. Find his average speed for the whole journey.",
        "options": [
          "48 km/h",
          "50 km/h",
          "52 km/h",
          "54 km/h"
        ],
        "correctIndex": 0,
        "explanation": "Average speed for equal distances = (2xy) / (x + y) = (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 km/h.",
        "difficulty": "Easy",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_12_3",
        "question": "A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.",
        "options": [
          "3 hours",
          "4 hours",
          "5 hours",
          "6 hours"
        ],
        "correctIndex": 1,
        "explanation": "Downstream speed = 13 + 4 = 17 km/h. Time taken = Distance / Speed = 68 / 17 = 4 hours.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_12_4",
        "question": "Walking at 3/4 of his usual speed, a man is 20 minutes late to reach his office. What is his usual time to reach the office?",
        "options": [
          "45 min",
          "50 min",
          "60 min",
          "75 min"
        ],
        "correctIndex": 2,
        "explanation": "Speed ratio = 4 : 3 => Time ratio = 3 : 4. Difference in time = 1 unit = 20 minutes. Usual time = 3 units = 3 × 20 = 60 minutes.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      }
    ]
  },
  {
    "chapterId": 13,
    "chapterNumber": "#13",
    "name": "Algebra — Basic → Advanced",
    "category": "Algebra",
    "categoryIcon": "🟪",
    "week": "Week 7–8",
    "difficulty": "Hard",
    "lessons": "30 Lessons",
    "youtubeTitle": "Algebra By Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhZIPbD4QtU0QfAqROv5m4aV",
    "description": "Symmetric expressions, value-putting methods, x + 1/x power transformations, homogeneous equations, polynomial identities.",
    "questions": [
      {
        "id": "apt_13_1",
        "question": "If x + 1/x = 3, find the value of (x^3 + 1/x^3).",
        "options": [
          "18",
          "21",
          "24",
          "27"
        ],
        "correctIndex": 0,
        "explanation": "x^3 + 1/x^3 = k^3 - 3k = 3^3 - 3(3) = 27 - 9 = 18.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      },
      {
        "id": "apt_13_2",
        "question": "If a + b + c = 0, what is the value of (a^3 + b^3 + c^3) / (abc)?",
        "options": [
          "0",
          "1",
          "3",
          "6"
        ],
        "correctIndex": 2,
        "explanation": "Standard identity: If a + b + c = 0, then a^3 + b^3 + c^3 = 3abc. Therefore, (3abc) / (abc) = 3.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_13_3",
        "question": "If x + 1/x = 5, find the value of (x^4 + 1/x^4).",
        "options": [
          "523",
          "527",
          "529",
          "531"
        ],
        "correctIndex": 1,
        "explanation": "x^2 + 1/x^2 = 5^2 - 2 = 23. x^4 + 1/x^4 = 23^2 - 2 = 529 - 2 = 527.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_13_4",
        "question": "If a/b + b/a = 1, find the value of (a^3 + b^3).",
        "options": [
          "-1",
          "0",
          "1",
          "2"
        ],
        "correctIndex": 1,
        "explanation": "a/b + b/a = 1 => (a^2 + b^2)/ab = 1 => a^2 - ab + b^2 = 0. Identity: a^3 + b^3 = (a + b)(a^2 - ab + b^2) = (a + b)(0) = 0.",
        "difficulty": "Hard",
        "sourceTag": "Accenture"
      }
    ]
  },
  {
    "chapterId": 14,
    "chapterNumber": "#14",
    "name": "Quadratic Equation",
    "category": "Algebra",
    "categoryIcon": "🟪",
    "week": "Week 8",
    "difficulty": "Medium",
    "lessons": "3 Lessons",
    "youtubeTitle": "Quadratic Equation BY Abhinay Sharma(Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhZ-GrYWtIUuHrP5n4AUpLJB",
    "description": "Nature of roots, discriminant, sum and product of roots, common roots condition, formation of quadratic equations.",
    "questions": [
      {
        "id": "apt_14_1",
        "question": "If α and β are the roots of the equation x^2 - 7x + 12 = 0, find the value of (α^2 + β^2).",
        "options": [
          "23",
          "25",
          "37",
          "49"
        ],
        "correctIndex": 1,
        "explanation": "Sum of roots α + β = 7, Product αβ = 12. α^2 + β^2 = (α + β)^2 - 2αβ = 7^2 - 2(12) = 49 - 24 = 25.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_14_2",
        "question": "For what value of k will the equation 2x^2 + kx + 8 = 0 have real and equal roots?",
        "options": [
          "±4",
          "±6",
          "±8",
          "±10"
        ],
        "correctIndex": 2,
        "explanation": "For real and equal roots, Discriminant D = b^2 - 4ac = 0 => k^2 - 4(2)(8) = 0 => k^2 - 64 = 0 => k = ±8.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_14_3",
        "question": "If one root of the quadratic equation x^2 - 6x + q = 0 is twice the other, find the value of q.",
        "options": [
          "6",
          "8",
          "9",
          "12"
        ],
        "correctIndex": 1,
        "explanation": "Let roots be r and 2r. Sum of roots = 3r = 6 => r = 2. The roots are 2 and 4. Product of roots q = 2 × 4 = 8.",
        "difficulty": "Medium",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_14_4",
        "question": "Find the quadratic equation whose roots are reciprocal to the roots of ax^2 + bx + c = 0.",
        "options": [
          "cx^2 + bx + a = 0",
          "cx^2 - bx + a = 0",
          "ax^2 - bx + c = 0",
          "bx^2 + ax + c = 0"
        ],
        "correctIndex": 0,
        "explanation": "Replacing x with 1/x in ax^2 + bx + c = 0 gives a(1/x)^2 + b(1/x) + c = 0 => a/x^2 + b/x + c = 0 => cx^2 + bx + a = 0.",
        "difficulty": "Medium",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 15,
    "chapterNumber": "#15",
    "name": "Surds & Indices",
    "category": "Algebra",
    "categoryIcon": "🟪",
    "week": "Week 8",
    "difficulty": "Medium",
    "lessons": "4 Lessons",
    "youtubeTitle": "Surds and Indices Special by Abhinay Sharma(Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYE3P8MKQHBBVJisy4qonmb",
    "description": "Laws of indices, rationalization of surds, square root of a + √b, infinite radical series patterns.",
    "questions": [
      {
        "id": "apt_15_1",
        "question": "Find the value of √(12 + √(12 + √(12 + ... ∞))).",
        "options": [
          "3",
          "4",
          "6",
          "12"
        ],
        "correctIndex": 1,
        "explanation": "Let x = √(12 + x) => x^2 - x - 12 = 0 => (x - 4)(x + 3) = 0. Since x > 0, x = 4.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_15_2",
        "question": "Find the square root of (7 + 4√3).",
        "options": [
          "2 + √3",
          "3 + √2",
          "2 - √3",
          "4 + √3"
        ],
        "correctIndex": 0,
        "explanation": "7 + 4√3 = 2^2 + (√3)^2 + 2(2)(√3) = (2 + √3)^2. Thus, the square root is (2 + √3).",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_15_3",
        "question": "If 2^(x+3) = 32, find the value of 3^(x+1).",
        "options": [
          "9",
          "27",
          "81",
          "243"
        ],
        "correctIndex": 1,
        "explanation": "2^(x+3) = 2^5 => x + 3 = 5 => x = 2. Value of 3^(x+1) = 3^(2+1) = 3^3 = 27.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_15_4",
        "question": "Which is the largest among 2^(1/2), 3^(1/3), 4^(1/4), and 6^(1/6)?",
        "options": [
          "2^(1/2)",
          "3^(1/3)",
          "4^(1/4)",
          "6^(1/6)"
        ],
        "correctIndex": 1,
        "explanation": "LCM of denominators (2, 3, 4, 6) = 12. Raise each to power 12: (2^1/2)^12 = 2^6 = 64; (3^1/3)^12 = 3^4 = 81; (4^1/4)^12 = 4^3 = 64; (6^1/6)^12 = 6^2 = 36. 81 is greatest, so 3^(1/3) is largest.",
        "difficulty": "Medium",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 16,
    "chapterNumber": "#16",
    "name": "Geometry",
    "category": "Geometry & Mensuration",
    "categoryIcon": "🟩",
    "week": "Week 10–11",
    "difficulty": "Hard",
    "lessons": "47 Lessons",
    "youtubeTitle": "Geometry By Abhinay Sir (Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhbUV72LqE0XK9Nx1dC3Wsvz",
    "description": "Lines, transversal angles, circles, tangents, secants, cyclic quadrilaterals, chord properties, and chord intersections.",
    "questions": [
      {
        "id": "apt_16_1",
        "question": "Two parallel chords of a circle of radius 10 cm are of lengths 12 cm and 16 cm. If they lie on opposite sides of the center, find the distance between them.",
        "options": [
          "10 cm",
          "12 cm",
          "14 cm",
          "16 cm"
        ],
        "correctIndex": 2,
        "explanation": "Distance from center to 12 cm chord = √(10^2 - 6^2) = 8 cm. Distance from center to 16 cm chord = √(10^2 - 8^2) = 6 cm. Since they are on opposite sides, total distance = 8 + 6 = 14 cm.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_16_2",
        "question": "In a cyclic quadrilateral ABCD, if ∠A = (2x + 4)° and ∠C = (x + 26)°, find the measure of ∠A.",
        "options": [
          "94°",
          "100°",
          "104°",
          "108°"
        ],
        "correctIndex": 2,
        "explanation": "Opposite angles of cyclic quadrilateral sum to 180°: (2x + 4) + (x + 26) = 180 => 3x + 30 = 180 => 3x = 150 => x = 50. ∠A = 2(50) + 4 = 104°.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_16_3",
        "question": "From an external point P, a tangent PT of length 12 cm is drawn to a circle, and a secant PAB intersects the circle at A and B. If PA = 8 cm, find the length of chord AB.",
        "options": [
          "8 cm",
          "10 cm",
          "12 cm",
          "18 cm"
        ],
        "correctIndex": 1,
        "explanation": "Tangent-secant theorem: PT^2 = PA × PB => 12^2 = 8 × PB => 144 = 8 × PB => PB = 18 cm. Chord AB = PB - PA = 18 - 8 = 10 cm.",
        "difficulty": "Hard",
        "sourceTag": "Placement Level"
      },
      {
        "id": "apt_16_4",
        "question": "The angle subtended by an arc at the center is 110°. What is the angle subtended by it at any point on the remaining part of the circle?",
        "options": [
          "35°",
          "55°",
          "70°",
          "110°"
        ],
        "correctIndex": 1,
        "explanation": "Angle at circumference = half of angle at center = 110° / 2 = 55°.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      }
    ]
  },
  {
    "chapterId": 17,
    "chapterNumber": "#17",
    "name": "Triangles",
    "category": "Geometry & Mensuration",
    "categoryIcon": "🟩",
    "week": "Week 11",
    "difficulty": "Hard",
    "lessons": "Full Course",
    "youtubeTitle": "Triangles by Abhinay Sharma(Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhZ8mukQdJMgz50NbHgKOc3V",
    "description": "Centroid, orthocenter, incenter, circumcenter, similarity of triangles, Apollonius theorem, Pythagoras applications.",
    "questions": [
      {
        "id": "apt_17_1",
        "question": "In triangle ABC, AD is the internal angle bisector of ∠A meeting BC at D. If AB = 8 cm, AC = 6 cm, and BC = 7 cm, find the length of BD.",
        "options": [
          "3 cm",
          "3.5 cm",
          "4 cm",
          "4.5 cm"
        ],
        "correctIndex": 2,
        "explanation": "Angle bisector theorem: BD / DC = AB / AC = 8 / 6 = 4 / 3. Total parts = 4 + 3 = 7. BD = (4 / 7) × 7 = 4 cm.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_17_2",
        "question": "The sides of a right-angled triangle are 6 cm, 8 cm, and 10 cm. Find the inradius of this triangle.",
        "options": [
          "1.5 cm",
          "2 cm",
          "2.5 cm",
          "3 cm"
        ],
        "correctIndex": 1,
        "explanation": "Inradius of right triangle r = (a + b - c) / 2 = (6 + 8 - 10) / 2 = 4 / 2 = 2 cm.",
        "difficulty": "Easy",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_17_3",
        "question": "The areas of two similar triangles ABC and PQR are 64 cm² and 121 cm² respectively. If QR = 15.4 cm, find BC.",
        "options": [
          "10.8 cm",
          "11.2 cm",
          "12.4 cm",
          "13.2 cm"
        ],
        "correctIndex": 1,
        "explanation": "Area(ABC)/Area(PQR) = (BC/QR)^2 => 64/121 = (BC/15.4)^2 => 8/11 = BC/15.4 => BC = (8 × 15.4) / 11 = 8 × 1.4 = 11.2 cm.",
        "difficulty": "Medium",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_17_4",
        "question": "In an equilateral triangle of side 12 cm, what is the length of its circumradius?",
        "options": [
          "2√3 cm",
          "4√3 cm",
          "6√3 cm",
          "8√3 cm"
        ],
        "correctIndex": 1,
        "explanation": "Circumradius of equilateral triangle R = a / √3 = 12 / √3 = 4√3 cm.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 18,
    "chapterNumber": "#18",
    "name": "Coordinate Geometry",
    "category": "Geometry & Mensuration",
    "categoryIcon": "🟩",
    "week": "Week 11",
    "difficulty": "Medium",
    "lessons": "17 Lessons",
    "youtubeTitle": "Coordinate Geometry By Abhinay Sir ( Abhinay Maths )",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhay0LpYuKUoMfjJ6atVonIw",
    "description": "Distance formula, section formula, area of triangle via coordinates, slope of line, parallel & perpendicular lines, circle equations.",
    "questions": [
      {
        "id": "apt_18_1",
        "question": "Find the distance between the points P(-3, 7) and Q(5, -8).",
        "options": [
          "15",
          "17",
          "19",
          "21"
        ],
        "correctIndex": 1,
        "explanation": "Distance = √[(5 - (-3))^2 + (-8 - 7)^2] = √[8^2 + (-15)^2] = √[64 + 225] = √289 = 17 units.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_18_2",
        "question": "Find the coordinates of the centroid of the triangle with vertices (2, -3), (4, 5), and (-3, 4).",
        "options": [
          "(1, 2)",
          "(3, 3)",
          "(1, 3)",
          "(2, 1)"
        ],
        "correctIndex": 0,
        "explanation": "Centroid G = ((x1+x2+x3)/3, (y1+y2+y3)/3) = ((2 + 4 - 3)/3, (-3 + 5 + 4)/3) = (3/3, 6/3) = (1, 2).",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_18_3",
        "question": "If two lines 3x + 4y = 9 and kx - 6y = 15 are perpendicular, find the value of k.",
        "options": [
          "-8",
          "6",
          "8",
          "12"
        ],
        "correctIndex": 2,
        "explanation": "Slope m1 = -3/4. Slope m2 = -k/(-6) = k/6. For perpendicular lines, m1 × m2 = -1 => (-3/4) × (k/6) = -1 => -3k / 24 = -1 => -k / 8 = -1 => k = 8.",
        "difficulty": "Medium",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_18_4",
        "question": "Find the area of the triangle whose vertices are (1, 2), (4, 6), and (7, 2).",
        "options": [
          "6 sq units",
          "12 sq units",
          "18 sq units",
          "24 sq units"
        ],
        "correctIndex": 1,
        "explanation": "Area = 1/2 |x1(y2 - y3) + x2(y3 - y1) + x3(y1 - y2)| = 1/2 |1(6 - 2) + 4(2 - 2) + 7(2 - 6)| = 1/2 |4 + 0 - 28| = 1/2 |-24| = 12 sq units.",
        "difficulty": "Medium",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 19,
    "chapterNumber": "#19",
    "name": "Trigonometry",
    "category": "Geometry & Mensuration",
    "categoryIcon": "🟩",
    "week": "Week 11–12",
    "difficulty": "Hard",
    "lessons": "37 Lessons",
    "youtubeTitle": "Trigonometry By Abhinay Sharma (Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhaeCI4LeaIaFcnFISC6S0w7",
    "description": "Trigonometric ratios, ASTC quadrant rules, standard angles table, fundamental identities, maximum and minimum values.",
    "questions": [
      {
        "id": "apt_19_1",
        "question": "If sin θ + cos θ = √2 cos θ, then the value of (cos θ - sin θ) is:",
        "options": [
          "√2 sin θ",
          "sin θ",
          "-√2 sin θ",
          "2 cos θ"
        ],
        "correctIndex": 0,
        "explanation": "Identity: (sin θ + cos θ)^2 + (cos θ - sin θ)^2 = 2. Let cos θ - sin θ = k. (√2 cos θ)^2 + k^2 = 2 => 2 cos^2 θ + k^2 = 2 => k^2 = 2(1 - cos^2 θ) = 2 sin^2 θ => k = √2 sin θ.",
        "difficulty": "Hard",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_19_2",
        "question": "Find the maximum value of the expression (3 sin θ + 4 cos θ + 5).",
        "options": [
          "5",
          "8",
          "10",
          "12"
        ],
        "correctIndex": 2,
        "explanation": "Maximum value of a sin θ + b cos θ is √(a^2 + b^2) = √(3^2 + 4^2) = 5. So maximum of (3 sin θ + 4 cos θ + 5) is 5 + 5 = 10.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_19_3",
        "question": "If tan θ = 4/3, evaluate (3 sin θ + 2 cos θ) / (3 sin θ - 2 cos θ).",
        "options": [
          "1",
          "2",
          "3",
          "4"
        ],
        "correctIndex": 2,
        "explanation": "Divide numerator and denominator by cos θ: (3 tan θ + 2) / (3 tan θ - 2) = (3(4/3) + 2) / (3(4/3) - 2) = (4 + 2) / (4 - 2) = 6 / 2 = 3.",
        "difficulty": "Easy",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_19_4",
        "question": "Evaluate: tan 1° · tan 2° · tan 3° · ... · tan 89°.",
        "options": [
          "0",
          "1/2",
          "1",
          "√3"
        ],
        "correctIndex": 2,
        "explanation": "Pairs tan θ · tan(90° - θ) = tan θ · cot θ = 1. tan 45° = 1. Product of all 44 pairs and tan 45° = 1.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 20,
    "chapterNumber": "#20",
    "name": "Height & Distance",
    "category": "Geometry & Mensuration",
    "categoryIcon": "🟩",
    "week": "Week 12",
    "difficulty": "Medium",
    "lessons": "Full Concept Series",
    "youtubeTitle": "Trigonometry & Height-Distance Series by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhaeCI4LeaIaFcnFISC6S0w7",
    "description": "Angle of elevation & depression, standard triangle ratios (30°-60°-90° and 45°-45°-90°), two-observation distance formulas.",
    "questions": [
      {
        "id": "apt_20_1",
        "question": "The angle of elevation of the top of a tower from a point on the ground 30 meters away from the foot of the tower is 30°. Find the height of the tower.",
        "options": [
          "10 m",
          "10√3 m",
          "20 m",
          "30√3 m"
        ],
        "correctIndex": 1,
        "explanation": "tan 30° = h / 30 => 1/√3 = h / 30 => h = 30 / √3 = 10√3 meters.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_20_2",
        "question": "From the top of a 60 m high cliff, the angles of depression of the top and bottom of a tower are observed to be 30° and 60° respectively. Find the height of the tower.",
        "options": [
          "30 m",
          "40 m",
          "45 m",
          "50 m"
        ],
        "correctIndex": 1,
        "explanation": "Distance to tower d = 60 / tan 60° = 60 / √3 = 20√3 m. Cliff height above tower = d × tan 30° = 20√3 × (1/√3) = 20 m. Height of tower = 60 - 20 = 40 meters.",
        "difficulty": "Hard",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_20_3",
        "question": "A kite is flying at a height of 75 meters attached to a string inclined at 60° to the horizontal. What is the length of the string?",
        "options": [
          "50√3 m",
          "60√3 m",
          "75√3 m",
          "100 m"
        ],
        "correctIndex": 0,
        "explanation": "sin 60° = Height / Length => √3 / 2 = 75 / L => L = (75 × 2) / √3 = 150 / √3 = 50√3 meters.",
        "difficulty": "Easy",
        "sourceTag": "Accenture"
      },
      {
        "id": "apt_20_4",
        "question": "If the length of the shadow of a vertical pole on horizontal ground is equal to its height, find the angle of elevation of the Sun.",
        "options": [
          "30°",
          "45°",
          "60°",
          "90°"
        ],
        "correctIndex": 1,
        "explanation": "tan θ = Height / Shadow. Since Height = Shadow, tan θ = 1 => θ = 45°.",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 21,
    "chapterNumber": "#21",
    "name": "Mensuration 2D",
    "category": "Geometry & Mensuration",
    "categoryIcon": "🟩",
    "week": "Week 12",
    "difficulty": "Medium",
    "lessons": "22 Lessons",
    "youtubeTitle": "Mensuration 2D by Abhinay Sharma (Abhinay Maths)",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhbOmjmffit-LVALSC5ZX-os",
    "description": "Area & perimeter of triangles, squares, rectangles, rhombuses, trapeziums, circles, pathways, and shaded sector regions.",
    "questions": [
      {
        "id": "apt_21_1",
        "question": "If the radius of a circle is decreased by 20%, by what percentage does its area decrease?",
        "options": [
          "20%",
          "36%",
          "40%",
          "44%"
        ],
        "correctIndex": 1,
        "explanation": "Area ∝ r^2. Percentage change = (-20 - 20 + (20 × 20)/100)% = -40 + 4 = -36% (i.e. 36% decrease).",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_21_2",
        "question": "The diagonals of a rhombus are 16 cm and 12 cm. Find the perimeter of the rhombus.",
        "options": [
          "32 cm",
          "36 cm",
          "40 cm",
          "48 cm"
        ],
        "correctIndex": 2,
        "explanation": "Half diagonals = 8 cm and 6 cm. Side s = √(8^2 + 6^2) = √100 = 10 cm. Perimeter = 4 × 10 = 40 cm.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_21_3",
        "question": "A rectangular lawn 60 m by 40 m has two roads each 5 m wide running in the middle of it, one parallel to the length and the other parallel to the breadth. Find the area of the roads.",
        "options": [
          "475 m²",
          "500 m²",
          "525 m²",
          "600 m²"
        ],
        "correctIndex": 0,
        "explanation": "Area of roads = w(l + b - w) = 5(60 + 40 - 5) = 5(95) = 475 m².",
        "difficulty": "Medium",
        "sourceTag": "Capgemini"
      },
      {
        "id": "apt_21_4",
        "question": "Find the area of a trapezium whose parallel sides are 18 cm and 14 cm, and the perpendicular distance between them is 9 cm.",
        "options": [
          "128 cm²",
          "144 cm²",
          "162 cm²",
          "180 cm²"
        ],
        "correctIndex": 1,
        "explanation": "Area = 1/2 × (a + b) × h = 1/2 × (18 + 14) × 9 = 1/2 × 32 × 9 = 16 × 9 = 144 cm².",
        "difficulty": "Easy",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 22,
    "chapterNumber": "#22",
    "name": "Mensuration 3D",
    "category": "Geometry & Mensuration",
    "categoryIcon": "🟩",
    "week": "Week 12",
    "difficulty": "Hard",
    "lessons": "4 Lessons",
    "youtubeTitle": "MENSURATION 3D by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYYwSjH9UQFhMxwAKIQCwYL",
    "description": "Cube, cuboid, cylinder, cone, sphere, hemisphere, frustum, prism, and pyramid volume and total surface area formulas.",
    "questions": [
      {
        "id": "apt_22_1",
        "question": "How many small metallic spheres of diameter 2 cm can be formed by melting a solid metallic cylinder of base radius 4 cm and height 45 cm?",
        "options": [
          "450",
          "540",
          "675",
          "900"
        ],
        "correctIndex": 1,
        "explanation": "Cylinder volume = π × r^2 × h = π × 4^2 × 45 = 720π. Sphere radius = 1 cm. Sphere volume = (4/3) × π × 1^3 = (4/3)π. Number of spheres = 720π / ((4/3)π) = 720 × 3 / 4 = 540 spheres.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_22_2",
        "question": "The length of the longest rod that can be placed in a room of dimensions 12 m × 9 m × 8 m is:",
        "options": [
          "15 m",
          "17 m",
          "19 m",
          "21 m"
        ],
        "correctIndex": 1,
        "explanation": "Diagonal of cuboid = √(l^2 + b^2 + h^2) = √(12^2 + 9^2 + 8^2) = √(144 + 81 + 64) = √289 = 17 meters.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_22_3",
        "question": "If the radius of a cylinder is doubled and the height is halved, the ratio of the new volume to the old volume is:",
        "options": [
          "1 : 1",
          "2 : 1",
          "4 : 1",
          "1 : 2"
        ],
        "correctIndex": 1,
        "explanation": "Old Volume V1 = π r^2 h. New Volume V2 = π (2r)^2 (h/2) = π (4r^2) (h/2) = 2π r^2 h = 2 V1. Ratio = 2 : 1.",
        "difficulty": "Easy",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_22_4",
        "question": "A solid sphere of radius 6 cm is melted and recast into a hollow cylinder of uniform thickness. If the external radius of the base of the cylinder is 5 cm and its height is 32 cm, find the uniform thickness of the cylinder.",
        "options": [
          "1 cm",
          "1.5 cm",
          "2 cm",
          "2.5 cm"
        ],
        "correctIndex": 0,
        "explanation": "Volume of sphere = 4/3 π (6^3) = 288π. Cylinder volume = π (R^2 - r^2) h = π (5^2 - r^2) × 32 = 32π (25 - r^2). Equating: 288π = 32π(25 - r^2) => 25 - r^2 = 9 => r^2 = 16 => r = 4 cm. Thickness = R - r = 5 - 4 = 1 cm.",
        "difficulty": "Hard",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 23,
    "chapterNumber": "#23",
    "name": "Probability",
    "category": "Data-Based",
    "categoryIcon": "🟧",
    "week": "Week 6",
    "difficulty": "Medium",
    "lessons": "Complete Course",
    "youtubeTitle": "Complete Course of Probability by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynhYdvTs9nMMkisfFcG0L-AV5",
    "description": "Coins, dice, pack of cards, balls in an urn, conditional probability, mutually exclusive and independent events.",
    "questions": [
      {
        "id": "apt_23_1",
        "question": "Two dice are thrown together. What is the probability that the sum of the numbers on the two faces is a prime number?",
        "options": [
          "5/12",
          "7/18",
          "5/9",
          "1/2"
        ],
        "correctIndex": 0,
        "explanation": "Prime sums possible: 2, 3, 5, 7, 11. Sum 2: (1,1) [1]; Sum 3: (1,2),(2,1) [2]; Sum 5: (1,4),(2,3),(3,2),(4,1) [4]; Sum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) [6]; Sum 11: (5,6),(6,5) [2]. Total favorable = 1 + 2 + 4 + 6 + 2 = 15. Probability = 15 / 36 = 5 / 12.",
        "difficulty": "Medium",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_23_2",
        "question": "From a pack of 52 cards, two cards are drawn at random together. What is the probability that both are aces?",
        "options": [
          "1/221",
          "1/169",
          "2/221",
          "4/663"
        ],
        "correctIndex": 0,
        "explanation": "P(Both Aces) = 4C2 / 52C2 = 6 / [ (52 × 51) / 2 ] = 6 / 1326 = 1 / 221.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_23_3",
        "question": "A bag contains 6 red balls, 4 white balls, and 5 blue balls. If three balls are drawn at random, find the probability that all of them are blue.",
        "options": [
          "2/91",
          "4/91",
          "5/91",
          "10/91"
        ],
        "correctIndex": 0,
        "explanation": "Total balls = 15. P(all 3 blue) = 5C3 / 15C3 = 10 / [ (15 × 14 × 13) / 6 ] = 10 / 455 = 2 / 91.",
        "difficulty": "Easy",
        "sourceTag": "Cognizant"
      },
      {
        "id": "apt_23_4",
        "question": "The probability that A solves a problem is 1/3 and that B solves it is 1/4. If both try independently, what is the probability that the problem is solved?",
        "options": [
          "1/2",
          "7/12",
          "5/12",
          "2/3"
        ],
        "correctIndex": 0,
        "explanation": "P(Solved) = 1 - P(Neither solves) = 1 - (1 - 1/3)(1 - 1/4) = 1 - (2/3)(3/4) = 1 - 1/2 = 1/2.",
        "difficulty": "Medium",
        "sourceTag": "Placement Level"
      }
    ]
  },
  {
    "chapterId": 24,
    "chapterNumber": "#24",
    "name": "Statistics",
    "category": "Data-Based",
    "categoryIcon": "🟧",
    "week": "Week 12",
    "difficulty": "Easy",
    "lessons": "Complete Course",
    "youtubeTitle": "Statistics by Abhinay Sharma",
    "youtubeUrl": "https://www.youtube.com/playlist?list=PLNUQFlO5ynha-JiqOqtfgUYDJ13G26a2o",
    "description": "Mean, median, mode, empirical relationship (Mode = 3 Median - 2 Mean), variance, standard deviation, and coefficient of variation.",
    "questions": [
      {
        "id": "apt_24_1",
        "question": "In a moderately asymmetrical distribution, the mean is 45 and the median is 48. Find the mode of the distribution.",
        "options": [
          "51",
          "54",
          "57",
          "60"
        ],
        "correctIndex": 1,
        "explanation": "Empirical formula: Mode = 3 Median - 2 Mean = 3(48) - 2(45) = 144 - 90 = 54.",
        "difficulty": "Easy",
        "sourceTag": "TCS NQT"
      },
      {
        "id": "apt_24_2",
        "question": "Find the median of the following data: 25, 14, 38, 29, 45, 19, 52, 33, 40.",
        "options": [
          "29",
          "33",
          "35",
          "38"
        ],
        "correctIndex": 1,
        "explanation": "Arrange in ascending order: 14, 19, 25, 29, 33, 38, 40, 45, 52. n = 9 (odd). Median is (9+1)/2 = 5th term = 33.",
        "difficulty": "Easy",
        "sourceTag": "Infosys"
      },
      {
        "id": "apt_24_3",
        "question": "The variance of a set of 10 observations is 16. What is the standard deviation?",
        "options": [
          "2",
          "4",
          "8",
          "256"
        ],
        "correctIndex": 1,
        "explanation": "Standard deviation = √(Variance) = √16 = 4.",
        "difficulty": "Easy",
        "sourceTag": "Wipro"
      },
      {
        "id": "apt_24_4",
        "question": "If the mean of a dataset is 25 and its standard deviation is 5, find its coefficient of variation (CV).",
        "options": [
          "15%",
          "20%",
          "25%",
          "30%"
        ],
        "correctIndex": 1,
        "explanation": "Coefficient of Variation (CV) = (Standard Deviation / Mean) × 100% = (5 / 25) × 100% = 20%.",
        "difficulty": "Medium",
        "sourceTag": "Placement Level"
      }
    ]
  }
];
