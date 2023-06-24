def handle_bad_request(e):
    return {'error' : str(e)}, 400

def handle_unauthorized(e):
    return {'error' : str(e)}, 401
