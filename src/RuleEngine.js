// src/RuleEngine.js
import React, { useState } from 'react';
import axios from 'axios';
import './RuleEngine.css'; // Import the CSS file for styles
import { BASE_URL } from './helper';
const RuleEngine = () => {
    const [ruleString, setRuleString] = useState('');
    const [rules, setRules] = useState([]); // Array to hold multiple rules
    const [userData, setUserData] = useState({
        age: '',
        department: '',
        salary: '',
        experience: ''
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name in userData) {
            setUserData({
                ...userData,
                [name]: value
            });
        } else if (name === 'rules') {
            if(value.length===0) {
                setRules([]);
            }
            else {
            setRules(value.split('\n'));
            } // Split by new line for multiple rules
        } else {
            setRuleString(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('processing..');
        setResult(null); // Reset result on new submission
        if(ruleString!=="" || rules.length!==0) {
        try {
            // Send the rules to the backend to create the AST
            var response;
            if(ruleString!==""){
                response = await axios.post(BASE_URL + '/create_rule', {
                rule_string: ruleString,
            });
           }
            if(rules.length!==0 ) {
                console.log(rules);
                response = await axios.post(BASE_URL + '/combine_rules', {
                    rules: rules,
                });
            }
            const ast = response.data.ast; // Assuming the response contains the AST
            // Evaluate the rule with the user data
            if(ast!==undefined) {const evaluationResponse = await axios.post(BASE_URL + '/evaluate_rule', {
                ast: ast,
                data: userData,
            });
            setResult(evaluationResponse.data.result);
            }
            else {
                setResult(false);
            }
        } catch (error) {
            console.error('Error evaluating rules:', error);
            setError('Error evaluating rules. Please check your input.');
        }
       }
       else {

       }
    };

    return (
        <div className="rule-engine-container mt-2 mb-2">
            <h2>Rule Engine</h2>
            <span className='m-1 text-success'>(You can lock the rules and change data to Evaluate)</span>
            <form className="rule-engine-form" onSubmit={handleSubmit}>
                {(rules.length===0) && (<div className="form-group">
                    <label>
                        Rule String (single rule):
                        <textarea
                            value={ruleString}
                            onChange={handleChange}
                            placeholder="Enter a single rule"
                            className="textarea"
                            required
                        />
                    </label>
                </div>)}
                {(ruleString.length===0) && <div className="form-group">
                    <label>
                        Multiple Rules (one per line):
                        <textarea
                            name="rules"
                            value={rules.join('\n')}
                            onChange={handleChange}
                            placeholder="Enter multiple rules (one per line)"
                            className="textarea"
                            required
                        />
                    </label>
                </div>}
                <div className="form-group">
                    <label>
                        Age:
                        <input
                            type="number"
                            name="age"
                            value={userData.age}
                            onChange={handleChange}
                            required
                            min={0}
                            max={100}
                            className="input"
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Department:
                        <input
                            type="text"
                            name="department"
                            value={userData.department}
                            onChange={handleChange}
                            required
                            className="input"
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Salary:
                        <input
                            type="number"
                            name="salary"
                            value={userData.salary}
                            onChange={handleChange}
                            required
                            min={0}
                            className="input"
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Experience:
                        <input
                            type="number"
                            name="experience"
                            value={userData.experience}
                            onChange={handleChange}
                            required
                            min={0}
                            className="input"
                        />
                    </label>
                </div>
                <button type="submit" className="submit-button">Evaluate</button>
            </form>
            {error && result === null && <p className="error-message">{error}</p>}
            {result !== null && (
                <div className="result">
                    <h3>Evaluation Result: {result ? 'Eligible' : 'Not Eligible'}</h3>
                </div>
            )}
        </div>
    );
};

export default RuleEngine;
