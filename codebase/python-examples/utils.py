"""
Utility functions for the sample application.
Contains helper functions for input validation and output formatting.
"""

def validate_input(data):
    """
    Validate the input data format.
    
    Args:
        data (str): The input data to validate
        
    Returns:
        bool: True if the data is valid, False otherwise
    """
    # Check if the data is empty
    if not data or not data.strip():
        return False
    
    # Check if the data contains at least one line
    lines = data.strip().split('\n')
    if len(lines) < 1:
        return False
    
    # All checks passed
    return True

def format_output(result):
    """
    Format the result data into a readable string.
    
    Args:
        result (dict): The result data to format
        
    Returns:
        str: The formatted output string
    """
    # Create a formatted string from the result dictionary
    output = "Processing Results:\n"
    output += "=" * 20 + "\n"
    
    for key, value in result.items():
        # Convert snake_case to Title Case for display
        display_key = ' '.join(word.capitalize() for word in key.split('_'))
        output += f"{display_key}: {value}\n"
    
    output += "=" * 20
    
    return output

def calculate_statistics(data):
    """
    Calculate various statistics from the input data.
    
    Args:
        data (str): The input data
        
    Returns:
        dict: A dictionary of calculated statistics
    """
    lines = data.strip().split('\n')
    words = ' '.join(lines).split()
    
    # Calculate statistics
    stats = {
        'line_count': len(lines),
        'word_count': len(words),
        'char_count': len(data),
        'avg_line_length': len(data) / max(len(lines), 1),
        'avg_word_length': sum(len(word) for word in words) / max(len(words), 1)
    }
    
    return stats
