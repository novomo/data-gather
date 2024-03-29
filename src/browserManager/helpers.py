import os, sys

def importModuleByPath(path):
    name = os.path.splitext(os.path.basename(path))[0]
    if sys.version_info[0] == 2:   
        # Python 2
        import imp
        return imp.load_source(name, path)
    elif sys.version_info[:2] <= (3, 4):  
        # Python 3, version <= 3.4
        from importlib.machinery import SourceFileLoader
        return SourceFileLoader(name, path).load_module()
    else:                            
        # Python 3, after 3.4
        import importlib.util
        spec = importlib.util.spec_from_file_location(name, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    
def chunks(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]