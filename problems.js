'use strict';

const PROBLEMS = [

  // ══════════════════════════════════════════════════════
  //  BEGINNER
  // ══════════════════════════════════════════════════════

  {
    id: 1,
    title: 'Sum of Array Elements',
    difficulty: 'BEGINNER',
    topic: 'Arrays',
    tags: ['#Arrays', '#Loops'],
    problem: `You are given an array of numbers. Write a function that returns the **sum of all elements** in the array.`,
    constraints: [
      'Array length: 1 ≤ n ≤ 1000',
      'Each element: -1000 ≤ arr[i] ≤ 1000',
    ],
    examples: [
      { input: '[1, 2, 3, 4, 5]',       output: '15',  explanation: '1+2+3+4+5 = 15' },
      { input: '[10, -3, 7]',            output: '14',  explanation: '10 + (-3) + 7 = 14' },
      { input: '[0, 0, 0]',              output: '0',   explanation: 'All zeros' },
    ],
    hints: [
      '💡 **Hint 1:** You need to visit every element in the array. Think about which loop is best for that.',
      '💡 **Hint 2:** You need a variable to keep a running total. What should its starting value be?',
      '💡 **Hint 3:** Inside the loop, add each element to your running total.',
      '💡 **Hint 4 (Pseudocode):**\n```\ntotal = 0\nfor each number in array:\n    total = total + number\nreturn total\n```',
    ],
    solution: {
      javascript: `function sumArray(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}`,
      python: `def sum_array(arr):\n    total = 0\n    for num in arr:\n        total += num\n    return total`,
    },
    timeComplexity:  'O(n) — we visit each element once.',
    spaceComplexity: 'O(1) — we only use one extra variable (total).',
    keyPatterns: ['for', 'total', 'sum', 'reduce', '+='],
    approachKeywords: ['loop', 'iterate', 'add', 'total', 'sum', 'accumulate'],
  },

  {
    id: 2,
    title: 'Find the Maximum Element',
    difficulty: 'BEGINNER',
    topic: 'Arrays',
    tags: ['#Arrays', '#Loops'],
    problem: `Given an array of integers, find and return the **largest number** in the array.`,
    constraints: [
      'Array length: 1 ≤ n ≤ 1000',
      'Each element: -10000 ≤ arr[i] ≤ 10000',
      'Do NOT use built-in max() or Math.max()',
    ],
    examples: [
      { input: '[3, 1, 7, 2, 9]',   output: '9',   explanation: '9 is the largest' },
      { input: '[-5, -1, -8, -2]',  output: '-1',  explanation: 'All negative — still pick the largest' },
      { input: '[42]',              output: '42',  explanation: 'Single element is always the max' },
    ],
    hints: [
      '💡 **Hint 1:** Start by assuming the first element is the maximum. Can you improve on it as you scan?',
      '💡 **Hint 2:** Loop through every element. If the current element is bigger than your stored max, update it.',
      '💡 **Hint 3:** Make sure you handle negative numbers — `max = 0` as a starting value would be wrong!',
      '💡 **Hint 4 (Pseudocode):**\n```\nmax = arr[0]\nfor each num in arr:\n    if num > max:\n        max = num\nreturn max\n```',
    ],
    solution: {
      javascript: `function findMax(arr) {\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) max = arr[i];\n  }\n  return max;\n}`,
      python: `def find_max(arr):\n    max_val = arr[0]\n    for num in arr[1:]:\n        if num > max_val:\n            max_val = num\n    return max_val`,
    },
    timeComplexity:  'O(n) — one pass through the array.',
    spaceComplexity: 'O(1) — only one extra variable.',
    keyPatterns: ['for', 'max', 'if', '>'],
    approachKeywords: ['loop', 'compare', 'track', 'variable', 'max', 'first'],
  },

  {
    id: 3,
    title: 'Reverse a String',
    difficulty: 'BEGINNER',
    topic: 'Strings',
    tags: ['#Strings', '#Loops'],
    problem: `Write a function that takes a string and returns it **reversed**.\n\n> Do NOT use built-in reverse methods (like \`.reverse()\` or \`[::-1]\`). Use a loop.`,
    constraints: [
      'String length: 0 ≤ n ≤ 1000',
      'Can contain spaces and special characters',
    ],
    examples: [
      { input: '"hello"',   output: '"olleh"',   explanation: 'Each character is flipped' },
      { input: '"race car"',output: '"rac ecar"', explanation: 'Spaces are also reversed' },
      { input: '"a"',       output: '"a"',        explanation: 'Single char stays same' },
    ],
    hints: [
      '💡 **Hint 1:** Strings are sequences of characters. Can you build a new string character by character?',
      '💡 **Hint 2:** Think about starting your loop from the **end** of the string and going backwards.',
      '💡 **Hint 3:** Or start with an empty result string and keep prepending each character.',
      '💡 **Hint 4 (Pseudocode):**\n```\nresult = ""\nfor i from last index down to 0:\n    result = result + str[i]\nreturn result\n```',
    ],
    solution: {
      javascript: `function reverseString(str) {\n  let result = '';\n  for (let i = str.length - 1; i >= 0; i--) {\n    result += str[i];\n  }\n  return result;\n}`,
      python: `def reverse_string(s):\n    result = ''\n    for i in range(len(s) - 1, -1, -1):\n        result += s[i]\n    return result`,
    },
    timeComplexity:  'O(n) — visit each character once.',
    spaceComplexity: 'O(n) — we build a new string of the same length.',
    keyPatterns: ['for', 'result', 'length', 'i--', 'range'],
    approachKeywords: ['loop', 'backwards', 'reverse', 'append', 'prepend', 'character'],
  },

  {
    id: 4,
    title: 'Count Vowels in a String',
    difficulty: 'BEGINNER',
    topic: 'Strings',
    tags: ['#Strings', '#Loops', '#Conditions'],
    problem: `Given a string, count and return the **number of vowels** in it.\n\nVowels are: **a, e, i, o, u** (both uppercase and lowercase count).`,
    constraints: [
      'String length: 0 ≤ n ≤ 1000',
      'Count both uppercase and lowercase vowels',
    ],
    examples: [
      { input: '"hello"',         output: '2',  explanation: '"e" and "o" are vowels' },
      { input: '"HELLO WORLD"',   output: '3',  explanation: '"E", "O", "O" are vowels' },
      { input: '"rhythm"',        output: '0',  explanation: 'No vowels' },
    ],
    hints: [
      '💡 **Hint 1:** You need to check each character in the string one by one.',
      '💡 **Hint 2:** How would you check if a character is a vowel? Think of a set or a string of vowels to compare against.',
      '💡 **Hint 3:** Convert the character to lowercase before checking — that handles both A and a at once.',
      '💡 **Hint 4 (Pseudocode):**\n```\ncount = 0\nvowels = "aeiou"\nfor each char in string:\n    if lowercase(char) is in vowels:\n        count = count + 1\nreturn count\n```',
    ],
    solution: {
      javascript: `function countVowels(str) {\n  const vowels = 'aeiou';\n  let count = 0;\n  for (let char of str) {\n    if (vowels.includes(char.toLowerCase())) count++;\n  }\n  return count;\n}`,
      python: `def count_vowels(s):\n    vowels = 'aeiou'\n    count = 0\n    for char in s:\n        if char.lower() in vowels:\n            count += 1\n    return count`,
    },
    timeComplexity:  'O(n) — one pass through the string.',
    spaceComplexity: 'O(1) — constant extra space.',
    keyPatterns: ['for', 'vowel', 'count', 'includes', 'in', 'lower'],
    approachKeywords: ['loop', 'check', 'vowel', 'count', 'character', 'compare'],
  },

  {
    id: 5,
    title: 'Check Palindrome',
    difficulty: 'BEGINNER',
    topic: 'Strings',
    tags: ['#Strings', '#TwoPointers'],
    problem: `A **palindrome** is a word that reads the same forwards and backwards.\n\nWrite a function that returns \`true\` if the given string is a palindrome, \`false\` otherwise.\n\n> Ignore spaces and treat uppercase/lowercase as the same.`,
    constraints: [
      'String length: 1 ≤ n ≤ 1000',
      'Ignore non-alphanumeric characters',
      'Case-insensitive comparison',
    ],
    examples: [
      { input: '"racecar"',      output: 'true',  explanation: '"racecar" reversed is "racecar"' },
      { input: '"hello"',        output: 'false', explanation: '"hello" reversed is "olleh"' },
      { input: '"A man a plan a canal Panama"', output: 'true', explanation: 'After cleanup it is a palindrome' },
    ],
    hints: [
      '💡 **Hint 1:** The simplest approach — clean the string (lowercase, remove spaces), then compare it to its reverse.',
      '💡 **Hint 2:** A smarter approach uses **two pointers** — one at the start, one at the end. Compare and move inward.',
      '💡 **Hint 3:** With two pointers: if the characters at both ends match, move both pointers inward. If they ever don\'t match, it\'s not a palindrome.',
      '💡 **Hint 4 (Pseudocode):**\n```\nclean = remove spaces, lowercase(string)\nleft = 0,  right = len(clean) - 1\nwhile left < right:\n    if clean[left] != clean[right]: return false\n    left++, right--\nreturn true\n```',
    ],
    solution: {
      javascript: `function isPalindrome(str) {\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  let left = 0, right = clean.length - 1;\n  while (left < right) {\n    if (clean[left] !== clean[right]) return false;\n    left++; right--;\n  }\n  return true;\n}`,
      python: `def is_palindrome(s):\n    clean = ''.join(c.lower() for c in s if c.isalnum())\n    left, right = 0, len(clean) - 1\n    while left < right:\n        if clean[left] != clean[right]:\n            return False\n        left += 1\n        right -= 1\n    return True`,
    },
    timeComplexity:  'O(n) — each character checked at most once.',
    spaceComplexity: 'O(n) — for the cleaned string.',
    keyPatterns: ['left', 'right', 'while', 'pointer', 'lower', 'reverse'],
    approachKeywords: ['reverse', 'compare', 'pointer', 'clean', 'loop', 'match'],
  },

  // ══════════════════════════════════════════════════════
  //  EASY
  // ══════════════════════════════════════════════════════

  {
    id: 6,
    title: 'Two Sum',
    difficulty: 'EASY',
    topic: 'Arrays',
    tags: ['#Arrays', '#Hashing'],
    problem: `Given an array of integers \`nums\` and a target integer \`target\`, return the **indices** of the two numbers that add up to target.\n\nAssume exactly one solution exists. You may not use the same element twice.`,
    constraints: [
      '2 ≤ nums.length ≤ 10,000',
      'Each element: -10^9 ≤ nums[i] ≤ 10^9',
      'Only one valid answer exists',
    ],
    examples: [
      { input: 'nums=[2,7,11,15], target=9',   output: '[0, 1]',  explanation: 'nums[0]+nums[1] = 2+7 = 9' },
      { input: 'nums=[3,2,4], target=6',        output: '[1, 2]',  explanation: 'nums[1]+nums[2] = 2+4 = 6' },
      { input: 'nums=[3,3], target=6',           output: '[0, 1]',  explanation: '3+3 = 6' },
    ],
    hints: [
      '💡 **Hint 1:** The brute force approach uses two nested loops to check every pair. That works but is slow (O(n²)). Can you do better?',
      '💡 **Hint 2:** For every number `x`, you need to find `target - x`. What data structure lets you look up a value in O(1) time?',
      '💡 **Hint 3:** Use a **HashMap**. As you walk through the array, store each number and its index. Before storing, check if `target - current` is already in the map.',
      '💡 **Hint 4 (Pseudocode):**\n```\nmap = {}\nfor i, num in enumerate(nums):\n    complement = target - num\n    if complement in map:\n        return [map[complement], i]\n    map[num] = i\n```',
    ],
    solution: {
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}`,
      python: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i`,
    },
    timeComplexity:  'O(n) — one pass using a HashMap.',
    spaceComplexity: 'O(n) — HashMap stores up to n elements.',
    keyPatterns: ['map', 'Map', 'dict', 'complement', 'target', 'hash'],
    approachKeywords: ['map', 'hash', 'complement', 'lookup', 'dictionary', 'store'],
  },

  {
    id: 7,
    title: 'Find the Missing Number',
    difficulty: 'EASY',
    topic: 'Arrays',
    tags: ['#Arrays', '#Math'],
    problem: `You are given an array containing **n distinct numbers** from the range **0 to n**. One number is missing. Find and return the missing number.`,
    constraints: [
      '1 ≤ n ≤ 10,000',
      'All numbers are distinct',
      'Numbers are in range [0, n]',
    ],
    examples: [
      { input: '[3, 0, 1]',       output: '2',  explanation: 'n=3, missing 2' },
      { input: '[0, 1]',          output: '2',  explanation: 'n=2, missing 2' },
      { input: '[9,6,4,2,3,5,7,0,1]', output: '8', explanation: 'n=9, missing 8' },
    ],
    hints: [
      '💡 **Hint 1:** If no number were missing, the array would have 0 through n. What is the sum of numbers 0 to n?',
      '💡 **Hint 2:** There is a formula for the sum of first n natural numbers: **n × (n+1) / 2**.',
      '💡 **Hint 3:** The missing number = expected sum − actual sum of the array.',
      '💡 **Hint 4 (Pseudocode):**\n```\nn = length of array\nexpected = n * (n + 1) / 2\nactual = sum of all elements in array\nreturn expected - actual\n```',
    ],
    solution: {
      javascript: `function missingNumber(nums) {\n  const n = nums.length;\n  const expected = n * (n + 1) / 2;\n  const actual = nums.reduce((a, b) => a + b, 0);\n  return expected - actual;\n}`,
      python: `def missing_number(nums):\n    n = len(nums)\n    expected = n * (n + 1) // 2\n    return expected - sum(nums)`,
    },
    timeComplexity:  'O(n) — one pass to sum the array.',
    spaceComplexity: 'O(1) — no extra space needed.',
    keyPatterns: ['sum', 'expected', 'n*(n+1)', 'reduce'],
    approachKeywords: ['sum', 'formula', 'expected', 'math', 'subtract'],
  },

  {
    id: 8,
    title: 'Check if Two Strings are Anagrams',
    difficulty: 'EASY',
    topic: 'Strings',
    tags: ['#Strings', '#Hashing'],
    problem: `Two strings are **anagrams** if they contain the same characters in any order.\n\nWrite a function that returns \`true\` if two strings are anagrams of each other, \`false\` otherwise.\n\n> Ignore spaces and case.`,
    constraints: [
      '1 ≤ s.length, t.length ≤ 50,000',
      'Case-insensitive',
      'Ignore spaces',
    ],
    examples: [
      { input: '"listen", "silent"',    output: 'true',  explanation: 'Same letters, different order' },
      { input: '"hello", "world"',      output: 'false', explanation: 'Different characters' },
      { input: '"Astronomer", "Moon starer"', output: 'true', explanation: 'Same letters ignoring spaces/case' },
    ],
    hints: [
      '💡 **Hint 1:** If two strings are anagrams, they must have the same length (after cleaning). Check that first.',
      '💡 **Hint 2:** One approach: sort both strings and compare. Anagrams will produce identical sorted strings.',
      '💡 **Hint 3:** A faster approach: use a frequency counter (HashMap). Count each character in the first string, then subtract for each character in the second.',
      '💡 **Hint 4 (Pseudocode):**\n```\nclean both strings (lowercase, no spaces)\nif lengths differ: return false\ncount = {}\nfor char in s: count[char]++\nfor char in t: count[char]--\nreturn all values in count are 0\n```',
    ],
    solution: {
      javascript: `function isAnagram(s, t) {\n  const clean = str => str.toLowerCase().replace(/\\s/g, '');\n  s = clean(s); t = clean(t);\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (let c of s) count[c] = (count[c] || 0) + 1;\n  for (let c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}`,
      python: `def is_anagram(s, t):\n    s = s.lower().replace(' ', '')\n    t = t.lower().replace(' ', '')\n    if len(s) != len(t): return False\n    from collections import Counter\n    return Counter(s) == Counter(t)`,
    },
    timeComplexity:  'O(n) — counting characters.',
    spaceComplexity: 'O(1) — at most 26 keys in the map (alphabet).',
    keyPatterns: ['count', 'Counter', 'sort', 'map', 'frequency'],
    approachKeywords: ['sort', 'count', 'frequency', 'map', 'hash', 'compare'],
  },

  {
    id: 9,
    title: 'Valid Parentheses',
    difficulty: 'EASY',
    topic: 'Stack',
    tags: ['#Stack', '#Strings'],
    problem: `Given a string containing only \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, determine if the input string is **valid**.\n\nA string is valid if:\n- Open brackets must be closed by the **same type** of bracket.\n- Open brackets must be closed in the **correct order**.`,
    constraints: [
      '1 ≤ s.length ≤ 10,000',
      'String only contains: ( ) { } [ ]',
    ],
    examples: [
      { input: '"()"',       output: 'true',  explanation: 'Simple pair' },
      { input: '"()[]{}"',   output: 'true',  explanation: 'Multiple valid pairs' },
      { input: '"(]"',       output: 'false', explanation: 'Wrong closing bracket' },
      { input: '"([)]"',     output: 'false', explanation: 'Incorrect order' },
    ],
    hints: [
      '💡 **Hint 1:** Think about what happens when you read an opening bracket — you need to remember it for when you see the closing bracket.',
      '💡 **Hint 2:** A **Stack** (Last In, First Out) is perfect here. Push opening brackets. When you see a closing bracket, check if the top of the stack matches.',
      '💡 **Hint 3:** Maintain a mapping: `)` → `(`, `}` → `{`, `]` → `[`. When you see a closing bracket, the top of the stack must equal its matching open bracket.',
      '💡 **Hint 4 (Pseudocode):**\n```\nstack = []\nfor char in s:\n    if char is opening: push to stack\n    else:\n        if stack is empty or top != match[char]: return false\n        pop from stack\nreturn stack is empty\n```',
    ],
    solution: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let c of s) {\n    if (!map[c]) { stack.push(c); }\n    else if (stack.pop() !== map[c]) return false;\n  }\n  return stack.length === 0;\n}`,
      python: `def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char not in mapping:\n            stack.append(char)\n        elif not stack or stack[-1] != mapping[char]:\n            return False\n        else:\n            stack.pop()\n    return not stack`,
    },
    timeComplexity:  'O(n) — each character processed once.',
    spaceComplexity: 'O(n) — stack can grow to size n.',
    keyPatterns: ['stack', 'push', 'pop', 'map', 'match'],
    approachKeywords: ['stack', 'push', 'pop', 'match', 'last in first out', 'lifo'],
  },

  // ══════════════════════════════════════════════════════
  //  MEDIUM
  // ══════════════════════════════════════════════════════

  {
    id: 10,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    topic: 'Strings',
    tags: ['#Strings', '#SlidingWindow', '#Hashing'],
    problem: `Given a string \`s\`, find the **length of the longest substring** that contains no repeating characters.`,
    constraints: [
      '0 ≤ s.length ≤ 50,000',
      'String contains English letters, digits, and symbols',
    ],
    examples: [
      { input: '"abcabcbb"', output: '3', explanation: '"abc" has length 3' },
      { input: '"bbbbb"',    output: '1', explanation: '"b" — every char repeats' },
      { input: '"pwwkew"',   output: '3', explanation: '"wke" has length 3' },
    ],
    hints: [
      '💡 **Hint 1:** A brute-force approach checks every substring — O(n²). Can you do it in one pass?',
      '💡 **Hint 2:** Think of a **sliding window** — a window with two pointers (left and right) that slides through the string.',
      '💡 **Hint 3:** Use a Set to track characters in the current window. Expand right pointer; if a duplicate is found, shrink from the left until the duplicate is removed.',
      '💡 **Hint 4 (Pseudocode):**\n```\nleft = 0, maxLen = 0\nseen = Set()\nfor right from 0 to n-1:\n    while s[right] in seen:\n        remove s[left] from seen\n        left++\n    add s[right] to seen\n    maxLen = max(maxLen, right - left + 1)\nreturn maxLen\n```',
    ],
    solution: {
      javascript: `function lengthOfLongestSubstring(s) {\n  const seen = new Set();\n  let left = 0, max = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (seen.has(s[right])) { seen.delete(s[left]); left++; }\n    seen.add(s[right]);\n    max = Math.max(max, right - left + 1);\n  }\n  return max;\n}`,
      python: `def length_of_longest_substring(s):\n    seen = set()\n    left = max_len = 0\n    for right, char in enumerate(s):\n        while char in seen:\n            seen.remove(s[left])\n            left += 1\n        seen.add(char)\n        max_len = max(max_len, right - left + 1)\n    return max_len`,
    },
    timeComplexity:  'O(n) — each character added/removed from set at most once.',
    spaceComplexity: 'O(min(n, m)) — m is the charset size (e.g. 26 for letters).',
    keyPatterns: ['set', 'Set', 'left', 'right', 'window', 'max'],
    approachKeywords: ['window', 'sliding', 'set', 'two pointer', 'shrink', 'expand'],
  },

  {
    id: 11,
    title: 'Fibonacci Sequence (Recursion)',
    difficulty: 'MEDIUM',
    topic: 'Recursion',
    tags: ['#Recursion', '#DynamicProgramming'],
    problem: `The **Fibonacci sequence** is: 0, 1, 1, 2, 3, 5, 8, 13, ...\n\nEach number is the sum of the two before it: \`F(n) = F(n-1) + F(n-2)\`\n\nWrite a function to return the **nth Fibonacci number**.\n\n> Start with a recursive solution, then think about how to optimize it.`,
    constraints: [
      '0 ≤ n ≤ 50',
      'F(0) = 0, F(1) = 1',
    ],
    examples: [
      { input: 'n = 0', output: '0',  explanation: 'Base case' },
      { input: 'n = 5', output: '5',  explanation: 'F(5) = 0,1,1,2,3,5' },
      { input: 'n = 10', output: '55', explanation: 'F(10) = 55' },
    ],
    hints: [
      '💡 **Hint 1:** Identify the **base cases**: What is F(0)? What is F(1)? These stop the recursion.',
      '💡 **Hint 2:** The recursive case: `fib(n) = fib(n-1) + fib(n-2)`. Write that directly.',
      '💡 **Hint 3:** Once that works, notice the problem — `fib(5)` calls `fib(4)` and `fib(3)`, but `fib(4)` also calls `fib(3)`. Repeated work! Can you **cache** results?',
      '💡 **Hint 4 (Pseudocode — with memo):**\n```\nmemo = {0: 0, 1: 1}\nfunction fib(n):\n    if n in memo: return memo[n]\n    memo[n] = fib(n-1) + fib(n-2)\n    return memo[n]\n```',
    ],
    solution: {
      javascript: `// With memoization\nfunction fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (memo[n]) return memo[n];\n  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n  return memo[n];\n}`,
      python: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)`,
    },
    timeComplexity:  'O(n) with memoization (vs O(2ⁿ) without).',
    spaceComplexity: 'O(n) — memo cache + call stack.',
    keyPatterns: ['memo', 'cache', 'recursive', 'base case', 'n-1', 'n-2'],
    approachKeywords: ['recursive', 'base case', 'memo', 'cache', 'overlap', 'subproblem'],
  },

  {
    id: 12,
    title: 'Binary Search',
    difficulty: 'MEDIUM',
    topic: 'Searching',
    tags: ['#Arrays', '#BinarySearch', '#DivideAndConquer'],
    problem: `Given a **sorted** array of integers and a target value, return the **index** of the target. If the target is not found, return \`-1\`.\n\n> You must write an O(log n) solution.`,
    constraints: [
      '1 ≤ nums.length ≤ 10,000',
      'Array is sorted in ascending order',
      'All elements are distinct',
    ],
    examples: [
      { input: 'nums=[-1,0,3,5,9,12], target=9', output: '4', explanation: '9 is at index 4' },
      { input: 'nums=[-1,0,3,5,9,12], target=2', output: '-1', explanation: '2 is not in array' },
      { input: 'nums=[5], target=5',              output: '0',  explanation: 'Single element match' },
    ],
    hints: [
      '💡 **Hint 1:** Because the array is sorted, you can eliminate half the elements in each step. Start by looking at the **middle element**.',
      '💡 **Hint 2:** If `mid == target`, return mid. If `target > mid`, search the right half. If `target < mid`, search the left half.',
      '💡 **Hint 3:** Use two pointers: `left = 0`, `right = n-1`. While `left <= right`, calculate mid and decide which half to search.',
      '💡 **Hint 4 (Pseudocode):**\n```\nleft = 0, right = n - 1\nwhile left <= right:\n    mid = (left + right) / 2\n    if nums[mid] == target: return mid\n    if nums[mid] < target: left = mid + 1\n    else: right = mid - 1\nreturn -1\n```',
    ],
    solution: {
      javascript: `function binarySearch(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
      python: `def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1`,
    },
    timeComplexity:  'O(log n) — halving the search space each iteration.',
    spaceComplexity: 'O(1) — no extra data structures.',
    keyPatterns: ['left', 'right', 'mid', 'while', 'floor', 'half'],
    approachKeywords: ['halve', 'middle', 'sorted', 'binary', 'left right', 'divide'],
  },

  // ══════════════════════════════════════════════════════
  //  HARD
  // ══════════════════════════════════════════════════════

  {
    id: 13,
    title: 'Climbing Stairs',
    difficulty: 'HARD',
    topic: 'Dynamic Programming',
    tags: ['#DynamicProgramming', '#Recursion'],
    problem: `You are climbing a staircase with **n steps**. Each time you can climb **1 or 2 steps**.\n\nIn how many **distinct ways** can you climb to the top?`,
    constraints: [
      '1 ≤ n ≤ 45',
    ],
    examples: [
      { input: 'n = 2', output: '2',  explanation: '(1+1) or (2)' },
      { input: 'n = 3', output: '3',  explanation: '(1+1+1), (1+2), (2+1)' },
      { input: 'n = 5', output: '8',  explanation: '8 distinct ways' },
    ],
    hints: [
      '💡 **Hint 1:** To reach step `n`, you must have come from step `n-1` (took 1 step) or step `n-2` (took 2 steps). So: ways(n) = ways(n-1) + ways(n-2).',
      '💡 **Hint 2:** Notice the pattern? This is exactly the Fibonacci sequence! ways(1)=1, ways(2)=2.',
      '💡 **Hint 3:** You can solve this with DP. Build a table from bottom up: fill dp[1], dp[2], ..., dp[n].',
      '💡 **Hint 4 (Pseudocode):**\n```\nif n <= 2: return n\ndp = array of size n+1\ndp[1] = 1, dp[2] = 2\nfor i from 3 to n:\n    dp[i] = dp[i-1] + dp[i-2]\nreturn dp[n]\n```',
    ],
    solution: {
      javascript: `function climbStairs(n) {\n  if (n <= 2) return n;\n  let prev2 = 1, prev1 = 2;\n  for (let i = 3; i <= n; i++) {\n    const curr = prev1 + prev2;\n    prev2 = prev1;\n    prev1 = curr;\n  }\n  return prev1;\n}`,
      python: `def climb_stairs(n):\n    if n <= 2:\n        return n\n    prev2, prev1 = 1, 2\n    for _ in range(3, n + 1):\n        prev2, prev1 = prev1, prev1 + prev2\n    return prev1`,
    },
    timeComplexity:  'O(n) — one loop through n.',
    spaceComplexity: 'O(1) — only two variables needed.',
    keyPatterns: ['dp', 'prev', 'fibonacci', 'n-1', 'n-2', 'climb'],
    approachKeywords: ['dp', 'dynamic', 'fibonacci', 'bottom up', 'subproblem', 'table'],
  },

  {
    id: 14,
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    difficulty: 'HARD',
    topic: 'Dynamic Programming',
    tags: ['#Arrays', '#DynamicProgramming', '#Greedy'],
    problem: `Given an integer array \`nums\`, find the **contiguous subarray** (containing at least one number) which has the **largest sum** and return its sum.`,
    constraints: [
      '1 ≤ nums.length ≤ 100,000',
      '-10,000 ≤ nums[i] ≤ 10,000',
    ],
    examples: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6',  explanation: '[4,-1,2,1] has sum 6' },
      { input: '[1]',                      output: '1',  explanation: 'Single element' },
      { input: '[5,4,-1,7,8]',             output: '23', explanation: 'Whole array' },
    ],
    hints: [
      '💡 **Hint 1:** Brute force checks every subarray. That\'s O(n²). Can you track the max as you go in one pass?',
      '💡 **Hint 2:** At each position, decide: should I **extend** the current subarray, or **start fresh** from this element? Start fresh if the current sum drops below the current element.',
      '💡 **Hint 3:** Track two values: `currentSum` (best sum ending here) and `maxSum` (best seen so far).',
      '💡 **Hint 4 (Pseudocode — Kadane\'s):**\n```\ncurrentSum = nums[0]\nmaxSum = nums[0]\nfor i from 1 to n-1:\n    currentSum = max(nums[i], currentSum + nums[i])\n    maxSum = max(maxSum, currentSum)\nreturn maxSum\n```',
    ],
    solution: {
      javascript: `function maxSubArray(nums) {\n  let current = nums[0], max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    current = Math.max(nums[i], current + nums[i]);\n    max = Math.max(max, current);\n  }\n  return max;\n}`,
      python: `def max_sub_array(nums):\n    current = max_sum = nums[0]\n    for num in nums[1:]:\n        current = max(num, current + num)\n        max_sum = max(max_sum, current)\n    return max_sum`,
    },
    timeComplexity:  'O(n) — single pass.',
    spaceComplexity: 'O(1) — only two variables.',
    keyPatterns: ['current', 'max', 'Math.max', 'kadane', 'subarray'],
    approachKeywords: ['greedy', 'kadane', 'extend', 'restart', 'current max', 'track'],
  },

];

// ── Quizzes ────────────────────────────────────────────────────────────────────
const QUIZZES = [
  {
    question: 'What is the time complexity of accessing an element in an array by index?',
    answer: '**O(1)** — Array access by index is constant time because arrays are stored in contiguous memory.',
    topic: 'Arrays',
  },
  {
    question: 'What data structure uses LIFO (Last In, First Out) order?',
    answer: '**Stack** — The last element pushed is the first to be popped. Think of a stack of plates.',
    topic: 'Stack',
  },
  {
    question: 'What is the difference between O(n) and O(log n)?',
    answer: '**O(n)** grows linearly with input size. **O(log n)** halves the problem each step (like binary search) — much faster for large inputs. Example: for n=1,000,000 → O(n) takes 1,000,000 steps, O(log n) takes only ~20 steps.',
    topic: 'Complexity',
  },
  {
    question: 'When would you use a HashMap instead of an Array?',
    answer: 'Use a **HashMap** when you need fast lookups by a key (O(1) average). Use an **Array** when you need ordered data or access by index. HashMaps trade memory for speed.',
    topic: 'Hashing',
  },
  {
    question: 'What is a recursive function?',
    answer: 'A function that **calls itself** with a smaller version of the problem until it reaches a **base case** (stopping condition). Without a base case, it loops forever (stack overflow)!',
    topic: 'Recursion',
  },
  {
    question: 'What is the time complexity of bubble sort?',
    answer: '**O(n²)** in the worst and average case — it compares every pair of adjacent elements. Best case O(n) if already sorted (with optimization).',
    topic: 'Sorting',
  },
  {
    question: 'What is memoization?',
    answer: '**Memoization** is caching the result of expensive function calls so that repeated calls with the same input return the cached result instantly. It turns an exponential recursive solution into a linear one (e.g., Fibonacci).',
    topic: 'Dynamic Programming',
  },
  {
    question: 'What does "in-place" mean in algorithms?',
    answer: 'An **in-place** algorithm modifies the input directly without using extra memory (O(1) space). For example, reversing an array using two pointers is in-place.',
    topic: 'General',
  },
];

module.exports = { PROBLEMS, QUIZZES };
