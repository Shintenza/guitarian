import { useAllPlugins } from "@/api/plugins";
import { GetAllPluginsSearchParams } from "@/api/plugins/types";
import { useForm, useWatch } from "react-hook-form";
import { useDebounce } from "use-debounce";

const useLibrarySearch = () => {
  const form = useForm<GetAllPluginsSearchParams>();
  const { class: effectClass, name } = useWatch({ control: form.control });

  const [debouncedName] = useDebounce(name, 500);

  const queryResult = useAllPlugins({
    class: effectClass,
    name: debouncedName,
  });

  return { form, queryResult };
};

export default useLibrarySearch;
