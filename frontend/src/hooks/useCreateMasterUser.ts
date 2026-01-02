import { useMutation } from '@tanstack/react-query';
import { createMasterUser } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/store/slices/authSlice';

export const useCreateMasterUser = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: createMasterUser,
    onSuccess: (data) => {
      console.log('Login SuccessFul:', data);
      dispatch(setUser(data))
      console.log("Get User Data in Login and Saved in Redux:", data);
      dispatch(setToken(data.token)); // save token to redux + sessionStorage
      router.push('/master-dashboard');
    },
    onError: (error) => {
      console.log("error in login", error.message);
      console.error('Error login user:', error);
    },
  });
};