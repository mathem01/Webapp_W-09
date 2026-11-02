import type { UserDTO } from "../user-mapper";

export function ProfileHeader({ profile }: { profile: UserDTO }) {
  const initial = profile.username.charAt(0).toUpperCase() || "?";
  return (
    <article aria-labelledby="profile-heading" className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="h-28 bg-indigo-400 sm:h-36" />
      <div className="px-6 pb-8 sm:px-8">
        <div aria-hidden="true" className="relative -mt-12 flex size-24 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-4xl font-bold text-indigo-700 shadow-sm">
          {initial}
        </div>
        <h2 id="profile-heading" className="mt-4 break-words text-2xl font-bold text-gray-900">@{profile.username}</h2>
        <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Brukernavn</dt>
            <dd className="mt-1 break-words text-sm text-gray-900 sm:col-span-2 sm:mt-0">{profile.username}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
